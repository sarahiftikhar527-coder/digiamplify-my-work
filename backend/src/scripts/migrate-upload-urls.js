import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { prisma } from '../config/db.js'
import { connectDB } from '../config/db.js'
import Profile from '../models/Profile.js'
import Chat from '../models/chat.js'
import {
  CHAT_ATTACHMENTS_DIR,
  PROFILE_DOCUMENTS_DIR,
} from '../config/uploads.js'
import {
  buildChatAttachmentUrl,
  buildProfileDocumentUrl,
  extractChatAttachmentFromUrl,
  extractProfileDocumentFileName,
  isAlreadyMigratedChatUrl,
  isAlreadyMigratedProfileUrl,
} from '../utils/fileUrls.js'

const apply = process.argv.includes('--apply')
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity

function diskPathForProfile(fileName) {
  return path.join(PROFILE_DOCUMENTS_DIR, fileName)
}

function diskPathForChat(fileName) {
  return path.join(CHAT_ATTACHMENTS_DIR, fileName)
}

function recordMissing(missing, ref, fileName, diskPath) {
  if (!fs.existsSync(diskPath)) {
    missing.push({ ref, fileName, diskPath })
  }
}

async function migrateProfiles(samples, stats, missing) {
  const profiles = await Profile.find({ 'documents.0': { $exists: true } })
  let processed = 0

  for (const profile of profiles) {
    if (processed >= limit) break

    let changed = false
    const documents = (profile.documents || []).map((doc) => {
      const next = { ...(doc?.toObject ? doc.toObject() : doc) }

      for (const field of ['url', 'backUrl']) {
        const current = next[field]
        if (!current || typeof current !== 'string') continue

        if (isAlreadyMigratedProfileUrl(current)) continue
        if (/^(blob:|data:|https?:)/i.test(current)) continue

        const fileName = extractProfileDocumentFileName(current)
        if (!fileName) continue

        const newUrl = buildProfileDocumentUrl(fileName)
        recordMissing(
          missing,
          `Profile ${profile._id} documents.${field}`,
          fileName,
          diskPathForProfile(fileName)
        )

        if (samples.length < 5) {
          samples.push({ before: current, after: newUrl })
        }

        if (current !== newUrl) {
          next[field] = newUrl
          changed = true
          stats.profileFields += 1
        }
      }

      return next
    })

    if (changed) {
      stats.profiles += 1
      if (apply) {
        profile.documents = documents
        await profile.save()
      }
    }

    processed += 1
  }
}

async function migrateChats(samples, stats, missing) {
  const chats = await Chat.find({
    'messages.attachments.0': { $exists: true },
  })

  let processed = 0

  for (const chat of chats) {
    if (processed >= limit) break

    let changed = false

    for (const message of chat.messages) {
      for (const attachment of message.attachments || []) {
        const currentUrl = attachment.url
        if (!currentUrl || isAlreadyMigratedChatUrl(currentUrl)) continue

        const { fileName, attachmentId } =
          extractChatAttachmentFromUrl(currentUrl)

        if (!fileName) continue

        const newUrl = buildChatAttachmentUrl(fileName)

        recordMissing(
          missing,
          `Chat ${chat._id} attachment ${attachmentId}`,
          fileName,
          diskPathForChat(fileName)
        )

        if (samples.length < 5) {
          samples.push({ before: currentUrl, after: newUrl })
        }

        if (attachment.id !== attachmentId) {
          if (apply) attachment.id = attachmentId
          changed = true
          stats.chatIds += 1
        }

        if (currentUrl !== newUrl) {
          if (apply) attachment.url = newUrl
          changed = true
          stats.chatUrls += 1
        }
      }
    }

    if (changed && apply) {
      await chat.save()
    }

    if (changed) stats.chats += 1
    processed += 1
  }
}

async function run() {
  await connectDB()

  const stats = {
    profiles: 0,
    profileFields: 0,
    chats: 0,
    chatUrls: 0,
    chatIds: 0,
  }
  const samples = []
  const missing = []

  await migrateProfiles(samples, stats, missing)
  await migrateChats(samples, stats, missing)

  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`)
  console.log('Summary:', stats)

  console.log('\nSample URL rewrites (up to 5):')
  samples.forEach((entry, index) => {
    console.log(`${index + 1}. BEFORE: ${entry.before}`)
    console.log(`   AFTER:  ${entry.after}`)
  })

  if (missing.length) {
    console.log(`\nMissing on disk (${missing.length}):`)
    missing.forEach((entry) => {
      console.log(`- ${entry.ref} -> ${entry.diskPath}`)
    })
  } else {
    console.log('\nNo missing files on disk for referenced uploads.')
  }

  if (!apply) {
    console.log('\nRe-run with --apply to persist MongoDB changes.')
  }

  await prisma.$disconnect()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

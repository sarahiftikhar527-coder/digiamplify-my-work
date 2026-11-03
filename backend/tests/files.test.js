import fs from 'fs'
import path from 'path'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'

const userA = new mongoose.Types.ObjectId()
const userB = new mongoose.Types.ObjectId()

const chatExistsMock = vi.fn()
const profileFindOneMock = vi.fn()
const profileFindMock = vi.fn()

vi.mock('../src/models/chat.js', () => ({
  default: {
    exists: (...args) => chatExistsMock(...args),
  },
}))

vi.mock('../src/models/Profile.js', () => ({
  default: {
    findOne: (...args) => profileFindOneMock(...args),
    find: (...args) => profileFindMock(...args),
  },
}))

let currentUser = {
  _id: userA,
  id: String(userA),
  role: 'employee',
}

vi.mock('../src/middlewares/auth.middleware.js', () => ({
  authenticate: (req, res, next) => {
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }
    req.user = currentUser
    next()
  },
}))

const {
  buildServeHeaders,
  shouldServeInline,
  sanitizeUploadFileName,
  resolvePathUnderRoot,
  assertChatAttachmentAccess,
} = await import('../src/modules/files/files.service.js')

const { CHAT_ATTACHMENTS_DIR, PROFILE_DOCUMENTS_DIR } = await import(
  '../src/config/uploads.js'
)

const app = (await import('../src/app.js')).default

describe('files.service helpers', () => {
  it('rejects path traversal in file names', () => {
    expect(() => sanitizeUploadFileName('../secret.pdf')).toThrow()
    expect(() => sanitizeUploadFileName('..%2Fsecret.pdf')).toThrow()
  })

  it('never serves SVG inline', () => {
    expect(shouldServeInline('photo.svg')).toBe(false)
    const headers = buildServeHeaders('photo.svg')
    expect(headers['Content-Disposition']).toMatch(/^attachment/)
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
  })

  it('serves PNG inline when allowed', () => {
    const fileName = 'a1b2c3d4-e5f6-4178-8967-123456789abc.png'
    const headers = buildServeHeaders(fileName)
    expect(headers['Content-Disposition']).toMatch(/^inline/)
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
  })

  it('keeps resolved paths inside upload root', () => {
    const fileName = 'a1b2c3d4-e5f6-4178-8967-123456789abc.pdf'
    const { absolutePath } = resolvePathUnderRoot(PROFILE_DOCUMENTS_DIR, fileName)
    expect(absolutePath.startsWith(PROFILE_DOCUMENTS_DIR)).toBe(true)
  })
})

describe('assertChatAttachmentAccess', () => {
  beforeEach(() => {
    chatExistsMock.mockReset()
  })

  it('allows a member when any chat references the attachment id', async () => {
    chatExistsMock.mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439099' })

    await expect(
      assertChatAttachmentAccess(
        { _id: userB, role: 'employee' },
        'a1b2c3d4-e5f6-4178-8967-123456789abc.pdf'
      )
    ).resolves.toBeUndefined()

    expect(chatExistsMock).toHaveBeenCalledWith({
      'messages.attachments.id': 'chat/a1b2c3d4-e5f6-4178-8967-123456789abc.pdf',
      'members.user': userB,
    })
  })

  it('returns 403 for a user removed from all chats (not in members)', async () => {
    chatExistsMock.mockResolvedValueOnce(null)
    chatExistsMock.mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439098' })

    await expect(
      assertChatAttachmentAccess(
        { _id: userA, role: 'employee' },
        'a1b2c3d4-e5f6-4178-8967-123456789abc.pdf'
      )
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('files HTTP routes', () => {
  const fileName = 'a1b2c3d4-e5f6-4178-8967-123456789abc.png'
  let tempPath = ''

  beforeEach(() => {
    currentUser = { _id: userA, id: String(userA), role: 'employee' }
    chatExistsMock.mockReset()
    profileFindOneMock.mockReset()
    profileFindMock.mockReset()

    fs.mkdirSync(CHAT_ATTACHMENTS_DIR, { recursive: true })
    tempPath = path.join(CHAT_ATTACHMENTS_DIR, fileName)
    fs.writeFileSync(tempPath, Buffer.from('fake-png'))
  })

  afterEach(() => {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  })

  it('returns 401 without authentication', async () => {
    currentUser = null
    const response = await request(app).get(`/api/v1/files/chat/${fileName}`)
    expect(response.status).toBe(401)
  })

  it('returns 404 for old public uploads path', async () => {
    const response = await request(app).get(
      `/uploads/profile-documents/${fileName}`
    )
    expect(response.status).toBe(404)
  })

  it('returns 403 when user is not a member of any chat with the attachment', async () => {
    chatExistsMock.mockResolvedValueOnce(null)
    chatExistsMock.mockResolvedValueOnce({ _id: 'abc' })

    const response = await request(app)
      .get(`/api/v1/files/chat/${fileName}`)
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(403)
  })

  it('streams chat files for members (forwarded attachment scenario)', async () => {
    chatExistsMock.mockResolvedValueOnce({ _id: 'forward-target-chat' })

    const response = await request(app)
      .get(`/api/v1/files/chat/${fileName}`)
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(200)
    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['content-disposition']).toMatch(/^inline/)
  })

  it('forces attachment disposition for SVG', async () => {
    const svgName = 'b2c3d4e5-f6a7-4890-b123-456789abcdef.svg'
    const svgPath = path.join(CHAT_ATTACHMENTS_DIR, svgName)
    fs.writeFileSync(svgPath, '<svg></svg>')

    chatExistsMock.mockResolvedValueOnce({ _id: 'chat-with-svg' })

    const response = await request(app)
      .get(`/api/v1/files/chat/${svgName}`)
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(200)
    expect(response.headers['content-disposition']).toMatch(/^attachment/)

    fs.unlinkSync(svgPath)
  })

  it('returns 403 for another employee profile document', async () => {
    profileFindOneMock.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        user: userB,
      }),
    })

    const response = await request(app)
      .get(`/api/v1/files/profile-documents/${fileName}`)
      .set('Authorization', 'Bearer test-token')

    expect(response.status).toBe(403)
  })
})

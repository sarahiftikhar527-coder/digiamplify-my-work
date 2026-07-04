import Image from 'next/image';
import ContactForm from '@/components/ContactForm/ContactForm';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen">
      <div className="max-w-[1200px] mx-auto pt-24 pb-20 px-6 lg:px-8 font-sans w-full">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8 mb-20 w-full">
          <div className="w-full lg:w-[55%]">
            <Title as="h1" className="pl-0 lg:pl-14 mb-18">
              Contact <span className="text-[#be0919]">Us</span>
            </Title>
            <p className="text-[#FFFFFF] leading-relaxed text-[0.9rem] mb-20 max-w-[90%]">
              Whether you're looking to launch a new project, enhance your digital presence, or explore innovative solutions, our team is here to help. We believe great partnerships begin with meaningful conversations, and we're always ready to discuss your goals, challenges, and opportunities for growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              <div className="shrink-0">
                <Image 
                  src="/assets/cube.png" 
                  alt="3D Glowing Cube" 
                  width={200} 
                  height={200}
                  className="object-contain" 
                />
              </div>
              <p className="text-[#FFFFFF] text-[0.85rem] leading-[1.8] max-w-[90%] -mr-10 sm:mt-4">
                With a commitment to transparency, quality, and results, we work closely with every client to ensure a smooth and successful experience. Your goals become our priority, and every solution is crafted with care, precision, and a focus on long-term value.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-[45%] flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="relative w-full max-w-[420px] aspect-[4/5]">
              <div className="absolute bottom-0 right-0 w-[82%] h-[82%] border-[4px] border-white bg-[#181818] z-0 shadow-2xl">
                <Image 
                  src="/assets/office-meeting.jpg" 
                  alt="Team meeting" 
                  fill 
                  className="object-cover object-center" 
                />
              </div>
              <div className="absolute -top-12 left-0 w-[42%] h-[38%] border-[4px] border-white z-10 bg-[#222] shadow-2xl">
                <Image 
                  src="/assets/agent-photo.jpg" 
                  alt="Support agent" 
                  fill 
                  className="object-cover object-center" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Contact Form Component*/}
        <div className="w-full">
          <ContactForm />
        </div>

        {/* Newsletter Section */}
        <section className="mt-20 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl py-10 px-8 lg:px-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 w-full">
          <div className="max-w-xl">
            <Title as="h3" className="mb-2">
              The Quarterly note for ambitious brands
            </Title>
            <p className="text-[#FFFFFF] text-[0.85rem] leading-relaxed">Occasional insight in digital positioning, launch strategy and premium experience Design.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            <input 
              type="email" 
              placeholder="Enter your Email" 
              className="bg-transparent border border-[#333] text-white py-3 px-6 rounded-full w-full sm:w-[280px] text-[0.85rem] focus:outline-none focus:border-[#be0919]" 
            />
            <Button variant="subscribe" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </div>
        </section>
        
        <p className="text-left text-[#555] text-[0.85rem] mt-6 px-2 lg:px-4 w-full">
          We respect your inbox. No noise. No spam. Only strategic perspective.
        </p>
      </div>
    </div>
  );
}
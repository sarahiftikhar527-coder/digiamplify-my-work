import Image from 'next/image';
import ContactForm from '@/components/ContactForm/ContactForm';
import Title from '@/components/ui/Title';
import Button from '@/components/ui/Button';
import Newsletter from '@/components/ui/Newsletter';

export default function ContactPage() {
  return (
    <div className="w-full bg-[#0d0d0d] min-h-screen">
      <div className="max-w-[1200px] mx-auto pt-24 pb-20 px-6 lg:px-8 font-sans w-full">
        
        {}
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
                  className="object-contain transition-transform duration-500 ease-out hover:scale-120" 
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
                  className="object-cover object-center transition-transform duration-500 ease-out hover:scale-110" 
                />
              </div>
              <div className="absolute -top-12 left-0 w-[42%] h-[38%] border-[4px] border-white z-10 bg-[#222] shadow-2xl">
                <Image 
                  src="/assets/agent-photo.jpg" 
                  alt="Support agent" 
                  fill 
                  className="object-cover object-center transition-transform duration-500 ease-out hover:scale-110" 
                />
              </div>
            </div>
          </div>
        </header>

        {}
        <div className="w-full">
          <ContactForm />
        </div>

        {}
        <Newsletter />
        
      </div>
    </div>
  );
}
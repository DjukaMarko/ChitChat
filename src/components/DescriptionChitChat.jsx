import { delay, motion, useAnimation } from "framer-motion";
import plant from "../../public/plant.png";
import graphics2 from "../../public/graphics2.png";
import graphics3 from "../../public/graphics4.png";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const textVariants = {
    hidden: {
      opacity: 0,
      x: "-100%",
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };
  
  const childVariants = {
    hidden: {
      opacity: 0,
      x: 100,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  };
export const DescriptionChitChat = ({ handleSignIn }) => {

    const controls = useAnimation();
    const [ref, inView] = useInView();
    useEffect(() => {
      if (inView) {
        controls.start("visible");
      }
    }, [inView]);
  return (
    <div className="w-full flex px-8 justify-center">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={textVariants}
        transition={{  duration: 0.3, delay: 5 }}
      >
        <motion.div variants={childVariants} className="flex justify-center flex-col space-y-6 md:flex-row items-center">
          <img className="w-[200px] lg:w-[300px]" src={plant} />
          <div className="flex max-w-[70ch] md:ml-36">
            <div className="flex items-center md:items-end space-y-4 flex-col">
                <h1 className="font-[600] text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#6A0606] to-[#DF2121]">DISCOVER</h1>
                <p className="font-[500] text-center text-[12px] md:text-[14px] lg:text-[16px] tracking-wide leading-[1.55] md:text-right font-poppins">
                ChitChat is not just another chat application; it's a dynamic
                platform designed to revolutionize the way you connect and
                communicate with others. Our innovative features and user-friendly
                interface create a seamless chatting experience that keeps you
                engaged and connected with your friends, family, and colleagues.
                </p>
            </div>
            <div className="w-[30px] bg-[#b01717] ml-4"></div>
          </div>
        </motion.div>
        <motion.div variants={childVariants} className="flex flex-col-reverse md:flex-row space-y-6 justify-center  items-center">
          <div className="flex max-w-[70ch] md:mr-36">
            <div className="w-[30px] bg-[#b01717] mr-4"></div>
            <div className="flex items-center md:items-start space-y-4 flex-col">
                <h1 className="font-[600] text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#DF2121] to-[#6A0606]">CONNECT</h1>
                <p className="font-[500] text-[12px] md:text-[14px] lg:text-[16px] tracking-wide leading-[1.55] text-center md:text-left font-poppins">
                With ChitChat, you can effortlessly engage in meaningful
                conversations, share your thoughts, and express yourself through
                text, voice messages, images, and more. Our cutting-edge
                technology ensures fast and secure messaging, so you can stay
                connected with your loved ones, no matter where they are in the
                world.
                </p>
            </div>
          </div>
          <img className="w-[200px] lg:w-[300px]" src={graphics2} />
        </motion.div>
        <motion.div variants={childVariants} className="flex justify-center flex-col space-y-6 md:flex-row items-center">
          <img className="w-[200px] lg:w-[300px]" src={graphics3} />
          <div className="flex max-w-[70ch] md:ml-36">
            <div className="flex items-center md:items-end space-y-4 flex-col">
                <h1 className="font-[600] text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#6A0606] to-[#DF2121]">CHITCHAT</h1>
                <p className="font-[500] text-center text-[12px] md:text-[14px] lg:text-[16px] tracking-wide leading-[1.55] md:text-right font-poppins">
                Whether you're looking to build relationships, foster teamwork, or simply have a good time, ChitChat is here to make every conversation count. Download ChitChat now and experience a new era of seamless communication. Get ready to explore, connect, and chat like never before!
                </p>
            </div>
            <div className="w-[30px] bg-[#b01717] ml-4"></div>
          </div>
        </motion.div>
        <motion.button
          drag
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={handleSignIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 1.1 }}
          className="flex mb-10 items-center space-x-4 py-3 px-6 mt-10 w-full justify-center md:w-auto md:justify-start rounded-3xl bg-gradient-to-r from-[#910b0b] to-[#DF2121]"
        >
          <p className="text-white font-[700] font-poppins tracking-wider">
            Join Now!
          </p>
        </motion.button>
      </motion.div>
    </div>
  );
};

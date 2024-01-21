import { useInView } from "react-intersection-observer";
import google from "../../public/google.png"
import graphics1 from "../../public/graphics1.png";
import { motion, useAnimation } from "framer-motion";  
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
      x: "-100%",
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

export const Hero = ({ handleSignIn }) => {
    const controls = useAnimation();
  const [ref, inView] = useInView();
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  return (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={textVariants}
        transition={{ duration: 0.3 }}
        className="px-[2rem] flex justify-center items-center space-y-6 flex-col md:block pt-[10rem] md:pt-[15rem] 2xl:px-[15rem]">
      <img className="max-w-[250px] md:hidden" src={graphics1} />
      <motion.p
        variants={childVariants}
        className="font-extrabold text-transparent md:ml-0 ml-[20px] text-2xl md:text-5xl xl:text-6xl lg:max-w-[25ch] tracking-wide bg-clip-text bg-gradient-to-r from-[#6A0606] to-[#DF2121] mb-10">
        “Connecting Conversations, One ChitChat at a Time!”
      </motion.p>
      <div className="relative">
        <motion.div variants={childVariants} className="flex max-w-[70ch] mb-12">
          <div className="w-[30px] bg-[#b01717] mr-4"></div>
          <p className="font-[500] text-[14px] md:text-[16px] tracking-wide leading-[1.55] text-left font-poppins">
            Discover a world of possibilities with ChitChat's diverse range of
            features. Join public chatrooms to connect with like-minded
            individuals, create private groups to collaborate with teammates, or
            simply have fun with entertaining stickers and emojis. Stay
            organized with message threads, search functionality, and easy file
            sharing options.
          </p>
        </motion.div>
        <img
          className="hidden 2xl:block 2xl:w-[450px] absolute right-1 bottom-[-150px]"
          src={graphics1}
        />
      </div>
      <motion.button
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={handleSignIn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 1.1 }}
        variants={childVariants}
        className="flex items-center space-x-4 w-full justify-center md:w-auto md:justify-start py-3 px-6 rounded-3xl bg-gradient-to-r from-[#910b0b] to-[#DF2121]"
      >
        <img src={google} className="w-[25px]" />
        <p className="text-white font-[700] font-poppins tracking-wider">
          Continue with Google
        </p>
      </motion.button>
    </motion.div>
  );
};

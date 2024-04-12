import { useInView } from "react-intersection-observer";
import google from "@/../public/google.png"
import graphics1 from "@/../public/graphics1.svg";
import wave from "@/../public/wave.svg";
import waveDark from "@/../public/waveDark.svg";
import { motion, useAnimation } from "framer-motion";
import { useContext, useEffect } from "react";
import { ThemeProvider } from "../misc/ThemeProvider";

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
  const { themeMode } = useContext(ThemeProvider);
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
      className="relative px-[2rem] flex justify-center items-center flex-col-reverse space-y-10 lg:space-y-0 lg:flex-row pt-[10rem] md:pt-[15rem] 2xl:px-[15rem]">

      <img className="absolute left-0 right-0 bottom-0" src={themeMode === "dark" ? waveDark: wave} />
      <div className="flex flex-col">
        <motion.p
          variants={childVariants}
          className="font-extrabold text-transparent md:ml-0 ml-[20px] text-2xl md:text-5xl xl:text-6xl lg:max-w-[25ch] tracking-wide bg-clip-text bg-gradient-to-r from-[#991b1b] to-[#b91c1c] mb-10">
          “Connecting Conversations, One ChitChat at a Time!”
        </motion.p>
        <div className="relative">
          <motion.div variants={childVariants} className="flex max-w-[70ch] mb-12">
            <div className="w-[30px] bg-gradient-to-b from-[#991b1b] to-[#b91c1c] mr-4"></div>
            <p className="font-[500] text-[14px] md:text-[16px] tracking-wide leading-[1.55] text-left font-poppins text-textColor">
              Discover a world of possibilities with ChitChat's diverse range of
              features. Join public chatrooms to connect with like-minded
              individuals, create private groups to collaborate with teammates, or
              simply have fun with entertaining stickers and emojis. Stay
              organized with message threads, search functionality, and easy file
              sharing options.
            </p>
          </motion.div>
          <motion.button
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={handleSignIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1.1 }}
            variants={childVariants}
            className="flex items-center space-x-4 w-full justify-center md:w-auto md:justify-start py-3 px-6 rounded-3xl bg-gradient-to-r from-[#991b1b] to-[#b91c1c]"
          >
            <img src={google} className="w-[25px]" />
            <p className="text-white font-[700] font-poppins tracking-wider">
              Continue with Google
            </p>
          </motion.button>
        </div>
      </div>
      <img className="w-80 lg:w-96 z-[1]" src={graphics1} />
    </motion.div>
  );
};

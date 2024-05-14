import "@/src/styles/Home.css";

import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import GoogleLoginButton from "@/src/components/Buttons/GoogleLoginButton";
import LaunchButton from "@/src/components/Buttons/LaunchButton";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import Link from "next/link";

const fastIcon = "/images/fast.png";
const accessibleIcon = "/images/accessible.png";
const qualityIcon = "/images/quality.png";
const quarkle = "/images/quarkle.png";
const ChatWithYourNovel = "/images/ChatWithYourNovel.gif";
const GetComments = "/images/GetComments.gif";
const TextGen = "/images/TextGen.gif";
const wordsIcon = "/images/words.png";
const countriesIcon = "/images/countries.png";
const novelsIcon = "/images/novels.png";
const flair1 = "/images/flair1.png";
const flair2 = "/images/flair2.png";
const flair3 = "/images/flair3.png";
const flair4 = "/images/flair4.png";
const flair5 = "/images/flair5.png";
const flair6 = "/images/flair6.png";
const securityIcon = "/images/securityIcon.svg";
const ownershipIcon = "/images/ownershipIcon.svg";
const trustedDiary = "/images/trustedDiary.svg";
const shuttle = "/images/shuttle.png";

function Home() {
  return (
    <>
      <div className="flex flex-col items-center self-center bg-gradient-radial-light dark:bg-gradient-radial-dark-2">
        <Alert className="h-[50]%">
          <AlertTitle className="font-montserrat text-very-dark-blue">
            {" "}
            <div className="flex gap-1">
              <img className="h-4 w-4" src={shuttle} alt="launch"></img>Quarkle Pro is Here!
            </div>
          </AlertTitle>
          <AlertDescription>
            {" "}
            <Link className="font-montserrat italic text-very-dark-blue hover:underline dark:text-gray-800" href="/pricing">
              Meet the smartest AI Editor in the World →
            </Link>
          </AlertDescription>
        </Alert>
        <Navbar />
        <div className="Home-Page mt-28 px-[7%]">
          <div className="Home-Page-One">
            <div className="Home-Text-Button-Container">
              <span className="text-center font-lato text-6xl font-bold text-[#070722] dark:text-white sm:text-left">
                From Draft to Dazzle
              </span>
              <span className="Home-Title-Subtext">Empower Your Writing Journey with an Expert AI Editor</span>
              <LaunchButton />
            </div>
            <iframe
              className=" m-5 mb-10 h-96 w-full rounded-lg  px-2 sm:mb-40 sm:h-[500px]"
              src="https://www.youtube.com/embed/tTn6i8mPnTU?autoplay=0&rel=0&loop=1&playlist=tTn6i8mPnTU&theme=dark"
              allow="autoplay"
              allowFullScreen
              title="video"
              seamless="seamless"
            />{" "}
            <img src={flair3} alt="design3" className="absolute -bottom-32 -right-4 w-5/12 sm:-bottom-48 sm:-right-16 sm:w-1/5"></img>
          </div>
          <div className="Home-Page-Two">
            <div className="Page-Two-Header-Container">
              <div className="Quarkle-Image-Conti">
                <img src={quarkle} alt="Quarkle" className="Quarkle-Img-Mascot"></img>
                <h2 className="Secondary-Header w-4/6 sm:w-1/2  ">Fast, Accessible, High-Quality Guaranteed</h2>
              </div>
              <span className="Secondary-Header-Subtext w-10/12 ">
                Ditch the exorbitant editing fees and endless waiting game. Experience high-quality editing at warp speed, without draining
                your wallet
              </span>
            </div>
            <div className="relative flex flex-col justify-between sm:flex-row ">
              <div className="Page-Two-Tile">
                <img className="Page-Two-Tile-Img" src={fastIcon} alt="Fast"></img>
                <h2 className="my-1 text-lg font-extrabold">Fast</h2>
                <span className="Page-Two-Tile-Subtext">Stop waiting weeks, get your feedback in seconds</span>
              </div>
              <div className="Page-Two-Tile">
                <img className="Page-Two-Tile-Img" src={accessibleIcon} alt="Accessible"></img>
                <h2 className="my-1 text-lg font-extrabold">Accessible</h2>
                <span className="Page-Two-Tile-Subtext">Over 100x cheaper than finding a developmental editor</span>
              </div>
              <div className="Page-Two-Tile">
                <img className="Page-Two-Tile-Img" src={qualityIcon} alt="High-Quality"></img>
                <h2 className="my-1 text-lg font-extrabold">High-Quality</h2>
                <span className="Page-Two-Tile-Subtext">In the vision of industry leading developmental editors</span>
              </div>
              <img src={flair5} alt="design1" className=" absolute -bottom-28 w-1/2 sm:-bottom-40 sm:-left-96 sm:w-2/6"></img>
            </div>
          </div>
          <div className="Home-Page-Three">
            <div className="Page-Three-Feature">
              <div className="Feature-Text-Container">
                <h1 className="Secondary-Header"> Converse with Your Creation</h1>
                <span className="Secondary-Header-Subtext">
                  Dialogue directly with your narrative as Quarkle immerses itself, reading every chapter, providing insights and
                  suggestions like a personal editor enchanted by your manuscript.
                </span>
              </div>
              <img src={ChatWithYourNovel} alt="Chat with your novel" className="Feature-Demo-Gif"></img>
            </div>

            <div className="Page-Three-Feature relative">
              <img src={GetComments} alt="Get annoted comments" className="Feature-Demo-Gif"></img>
              <div className="Feature-Text-Container">
                <h1 className="Secondary-Header"> Feedback That Illuminates</h1>
                <span className="Secondary-Header-Subtext">
                  Experience real-time editorial wisdom as Quarkle annotates your text, highlighting opportunities for development and depth
                  in your storytelling
                </span>
              </div>
              <img src={flair4} alt="design1" className=" absolute -bottom-20 right-10 w-1/4 sm:-bottom-20 sm:right-48 sm:w-1/6"></img>
            </div>

            <div className="Page-Three-Feature">
              <div className="Feature-Text-Container">
                <h1 className="Secondary-Header"> Your Voice, Continued</h1>
                <span className="Secondary-Header-Subtext">
                  Empower your narrative with Quarkle’s intuitive understanding of your writing style, ensuring tonal consistency and
                  contextual coherence throughout your manuscript.
                </span>
              </div>
              <img src={TextGen} alt="Generate text in your voice" className="Feature-Demo-Gif"></img>
            </div>

            <div className="Home-Page-Four">
              <img src={flair6} alt="design1" className="absolute -left-8 -top-16 w-1/2 sm:-left-48 sm:-top-48"></img>
              <div className="Show-Off-Container">
                <img className="Show-Off-Icon" src={wordsIcon} alt="words"></img>
                <span className="Show-Off-Title">30M+</span>
                <span className="Show-Off-Subtitle">Words Written</span>
              </div>
              <div className="Show-Off-Container">
                <img className="Show-Off-Icon" id="Novel-Icon" src={novelsIcon} alt="novels"></img>
                <span className="Show-Off-Title">1500+</span>
                <span className="Show-Off-Subtitle">Books Crafted</span>
              </div>
              <div className="Show-Off-Container">
                <img className="Show-Off-Icon" src={countriesIcon} alt="countries"></img>
                <span className="Show-Off-Title">50+</span>
                <span className="Show-Off-Subtitle">Countries</span>
              </div>
              <img src={flair1} alt="design1" className="absolute -bottom-36 -right-10 w-1/2 sm:-bottom-60 sm:-right-36 sm:w-1/4 "></img>
            </div>

            <div className=" flex flex-col items-center">
              <div className="w-9/12 self-center text-center ">
                <h1 className="mb-4 text-center font-lato text-4xl font-bold text-[#070722] dark:text-[#fffffc] sm:text-5xl">
                  Your Stories, Safely Tucked Away
                </h1>
                <p className="Secondary-Header-Subtext text-center">
                  Craft with Confidence as we keep your creation Private and Secure. Here's the Quarkle promise:
                </p>
              </div>
              <div className="mt-8 flex flex-col items-center justify-center text-[#14142d] md:flex-row md:justify-around">
                <div className=" m-2 flex max-w-sm flex-col items-center rounded-lg bg-[#c6c5ed] p-4 shadow-md dark:bg-[#fffffc] sm:w-[32rem]">
                  <img className="h-24 w-24" src={trustedDiary} alt="Security" />
                  <h2 className="text-xl font-bold">Just Between Us</h2>
                  <p className="text-center text-lg">
                    Think of us as your trusty diary. Your manuscripts are your private stories, and we’re here to keep them that way.
                  </p>
                </div>
                <div className=" m-2 flex max-w-sm flex-col items-center rounded-lg bg-[#c6c5ed] p-4 shadow-md dark:bg-[#fffffc] sm:w-[32rem]">
                  <img className="h-24 w-24" src={securityIcon} alt="Security" />
                  <h2 className="text-xl font-bold">Safe Travels for Your Words</h2>
                  <p className="text-center text-lg">
                    Your words are snugly wrapped in encryption as they journey to and from Quarkle, like secret letters!
                  </p>
                </div>
                <div className="m-2 flex max-w-sm flex-col items-center rounded-lg bg-[#c6c5ed] p-4 shadow-md dark:bg-[#fffffc] sm:w-[32rem]">
                  <img className="h-24 w-24" src={ownershipIcon} alt="Ownership" />
                  <h2 className="text-xl font-bold">Your Work, Your Rules</h2>
                  <p className="text-center text-lg">
                    At Quarkle, what you create remains solely yours. We're here to help refine your work, not claim any part of it.
                  </p>
                </div>
              </div>
            </div>

            <div className="Home-Page-Five relative">
              <h1 className="Secondary-Header mt-20">Ready to Elevate Your Manuscript?</h1>
              <span className="w-5/6 text-center text-2xl text-[#070722] dark:text-white sm:w-3/5">
                Quarkle is an advanced AI-powered Editorial Assistant designed to revolutionize the self-publishing landscape. Our platform
                offers high-quality, efficient, and affordable developmental editing solutions, streamlining the editing process for authors
                worldwide.
              </span>
              <GoogleLoginButton />
              <h1 className=" text-center text-3xl text-[#070722] dark:text-white sm:text-5xl">Try Quarkle For Free</h1>
              <img src={flair2} alt="design2" className="absolute -bottom-28 left-1/2 w-1/3 sm:-bottom-10 sm:left-0 sm:w-1/4"></img>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Home;

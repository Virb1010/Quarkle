import React from "react";
import "@/src/styles/Footer.css";
import Image from "next/image";

const logo = "/images/logo_white_large.png";
const TumblrImg = "/images/tumblr.png";
const InstaImg = "/images/insta.png";
const YoutubeImg = "/images/youtube.png";
const FBImg = "/images/fb.png";

function Footer() {
  return (
    <div className="Footer-Container text-black dark:text-white">
      <footer className="Footer">
        <div className="footer-left">
          <div className="flex items-center justify-center gap-2 hover:scale-105">
            <Image src={logo} alt="Logo" width={70} height={70} className="invert filter dark:invert-0" />
            <span className="font-lato text-2xl font-extrabold  sm:block sm:text-4xl">Quarkle</span>
          </div>
          <span className=" my-4 w-10/12 text-lg font-medium">
            Craft compelling narratives more efficiently on a platform engineered for collaborative editing with AI
          </span>
        </div>
        <div className="footer-right">
          <h3 className="my-1 text-3xl font-bold">Support</h3>
          <a href="mailto:samarth@quarkle.ai" target="_blank" rel="noreferrer">
            <button className="contact-us-button">Contact Us</button>
          </a>
          <a href="https://quarkle.canny.io/feature-requests/" target="_blank" rel="noreferrer">
            <button className="contact-us-button">Feedback</button>
          </a>
          <a
            href={
              process.env.NEXT_PUBLIC_ENV === "production"
                ? "https://www.quarkle.ai/privacy"
                : process.env.NEXT_PUBLIC_ENV === "staging"
                ? "https://staging.quarkle.ai/privacy"
                : "http://localhost:3000/privacy"
            }
            target="_blank"
            rel="noreferrer"
          >
            <button className="contact-us-button">Privacy Policy</button>
          </a>
          <a
            href={
              process.env.NEXT_PUBLIC_ENV === "production"
                ? "https://www.quarkle.ai/terms"
                : process.env.NEXT_PUBLIC_ENV === "staging"
                ? "https://staging.quarkle.ai/terms"
                : "http://localhost:3000/terms"
            }
            target="_blank"
            rel="noreferrer"
          >
            <button className="contact-us-button">Terms of Service</button>
          </a>
        </div>
        <div className="footer-right">
          <h1 className="my-2 mt-6 text-3xl font-bold sm:my-1">Follow Us</h1>
          <div className="Social-Icons-Grid invert filter dark:invert-0">
            <a href="https://www.youtube.com/@Quarkleai/" target="_blank" rel="noreferrer">
              <img src={YoutubeImg} alt="Youtube" className="social-icon" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61551836773412" target="_blank" rel="noreferrer">
              <img src={FBImg} alt="Facebook" className="social-icon" />
            </a>
            <a href="https://www.instagram.com/quarkle.ai/" target="_blank" rel="noreferrer">
              <img src={InstaImg} alt="Insta" className="social-icon" />
            </a>
            <a href="https://www.tumblr.com/quarklooo/" target="_blank" rel="noreferrer">
              <img src={TumblrImg} alt="Tumblr" className="social-icon" />
            </a>
          </div>
        </div>
      </footer>
      <span className="Copyright">© 2023 Quarkle. All rights reserved</span>
    </div>
  );
}

export default Footer;

import React, { createContext, useState } from 'react'
export const DataContext = createContext()

const UserContext = ({ children }) => {
  let [speaking, setSpeaking] = useState(0)
  let [text, setText] = useState("listening")
  let [response, setResponse] = useState(false)

  //This is for Speaking text 
  const speak = (text) => {
    let textSpeak = new SpeechSynthesisUtterance(text)
    textSpeak.volume = 1;
    textSpeak.rate = 1;
    textSpeak.pitch = 1;
    textSpeak.lang = "hi-GB";
    window.speechSynthesis.speak(textSpeak)
  }

  //From Here The microphone Get Active in chrome region
  let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let recognition = new speechRecognition()
  recognition.onresult = (e) => {
    let currentIndex = e.resultIndex
    let transcript = e.results[currentIndex][0].transcript

    // Prevent AI from listening to itself
    if (window.speechSynthesis.speaking) {
      return;
    }

    setText(transcript)
    takeCommand(transcript.toLowerCase())
  }
  //Time function Telling current Time Now
  function tellTime() {
    let now = new Date();
    let hours = now.getHours();
    let minute = now.getMinutes();

    let ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12;
    hours = hours ? hours : 12;

    minute = minute < 10 ? "0" + minute : minute;

    let timeString = `The Time is ${hours}:${minute}${ampm}`
    speak(timeString)
  }



  function takeCommand(command) {
    if (command.includes("open") && command.includes("youtube")) {
      window.open("https://www.youtube.com/", "_blank");
      speak("Opening YouTube");
      setText("Opening YouTube");
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 7000);
    } else if (command.includes("open") && command.includes("whatsapp")) {
      window.open("https://www.whatsapp.com/", "_blank");
      speak("Opening Whatsapp");
      setText("Opening Whatsapp");
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 7000);

    } else if (command.includes("open") && command.includes("calculator")) {
      window.open("https://www.calculator.net/", "_blank");
      speak("Opening Calculator");
      setText("Opening Calculator");
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 7000);

    }

    else if (command.includes("open") && command.includes("google")) {
      window.open("https://www.google.com/", "_blank");
      speak("Opening Google");
      setText("Opening google");
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 7000);
    } else if (command.includes("open") && command.includes("instagram")) {
      window.open("https://www.instagram.com/", "_blank");
      speak("Opening instagram");
      setText("Opening instagram");
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 7000);
    }
    else if (command.includes("what is time now")) {
      speak(tellTime())
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 4000);
    }
    else if (command.includes("todays date")) {
      speak('I am an AI Model I can\'t tell you todays Date Please Check Your Mobile screen')
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 7000);
    } else {
      speak("I'm sorry, I don't understand that command.")
      setText("Command not recognized")
      setResponse(true)
      setTimeout(() =>
        setSpeaking(false), 3000);
    }
  }

  let value = {
    recognition,
    speaking,
    setSpeaking,
    text,
    setText,
    response,
    setResponse

  }

  return (
    <div>
      <DataContext.Provider value={value}>
        {children}
      </DataContext.Provider>

    </div>
  )
}

export default UserContext;
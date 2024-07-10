"use client";
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/message";
import { Send } from "react-feather";
import LoadingDots from "@/components/LoadingDots";
import { marked } from "marked";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello, can I help you?",
    },
  ]);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  function dokuWikiToMarkdown(text) {
    // Convert bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '**$1**');
    
    // Convert images

    const domain = 'https://wiki.scalably.com/lib/exe/fetch.php?media='
    text = text.replace(/{{ :(.*?)\?(.*?) \|}}/g, `<img src="${domain}$1" width="$2" alt="image" />`);
  
    // Convert links
    text = text.replace(/\[\[(.*?)\|(.*?)\]\]/g, '[$2]($1)');
  
    // Convert headers
    text = text.replace(/====== (.*?) ======/g, '# $1');
    const htmlText = marked(text);

    return htmlText;
  }
  
  
  const handleClick = () => {
    if (message == "") return;
    setHistory((oldHistory) => [
      ...oldHistory,
      { role: "user", content: message },
    ]);
    setMessage("");
    setLoading(true);
    fetch(`${process.env.URL_API_CHAT_BOT}/bots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message, history: history }),
    })
      .then(async (res) => {
        const r = await res.json();

        setHistory((oldHistory) => [
          ...oldHistory,
          { role: "assistant", content: r?.data, links: [] },
        ]);
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
      });
  };

  const handleSyncClick = () => {
    fetch(`${process.env.URL_API_CHAT_BOT}/sync`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const r = await res.json();
        alert(r?.message);
        console.log(r);
      })
      .catch((err) => {
        alert(err);
      });
  };

  const formatPageName = (url: string) => {
    // Split the URL by "/" and get the last segment
    const pageName = url && url?.split("/").pop();

    // Split by "-" and then join with space
    if (pageName) {
      const formattedName = pageName.split("-").join(" ");

      // Capitalize only the first letter of the entire string
      return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    }
  };

  //scroll to bottom of chat
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <main className="h-screen bg-white p-6 flex flex-col">
      <div className="flex flex-col gap-8 w-full items-center flex-grow max-h-full">
        <h1 className=" text-4xl text-transparent bg-clip-text bg-gradient-to-r from-violet-800 to-fuchsia-500 font-semibold">
          SCALABLY INC. R&D LAB
        </h1>
        <form
          className="rounded-2xl border-purple-700 border-opacity-5  border lg:w-3/4 flex-grow flex flex-col bg-[url('/images/bg.png')] bg-cover max-h-full overflow-clip"
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          <div className="flex justify-end">
            <button
              onClick={handleSyncClick}
              className="w-[80px] mr-2 bg-gradient-to-r from-violet-800 to-fuchsia-500 text-white py-1.5 mt-2 rounded-lg"
            >
              Sync
            </button>
          </div>
          <div className="overflow-y-scroll flex flex-col gap-5 p-10 h-full">
            {history.map((message: Message, idx) => {
              const isLastMessage = idx === history.length - 1;
              switch (message.role) {
                case "assistant":
                  return (
                    <div
                      ref={isLastMessage ? lastMessageRef : null}
                      key={idx}
                      className="flex gap-2"
                    >
                      <img
                        src="images/assistant-avatar.png"
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                        <p className="text-sm font-medium text-violet-500 mb-2">
                          Scalably AI Assistant
                        </p>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: dokuWikiToMarkdown(message?.content || ''),
                          }}
                        />
                        {message.links && (
                          <div className="mt-4 flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-500">
                              Sources:
                            </p>

                            {message.links?.map((link) => {
                              return (
                                <a
                                  href={link}
                                  key={link}
                                  className="block w-fit px-2 py-1 text-sm  text-violet-700 bg-violet-100 rounded"
                                >
                                  {formatPageName(link)}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                case "user":
                  return (
                    <div
                      className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tl-xl text-black p-6 self-end shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                      key={idx}
                      ref={isLastMessage ? lastMessageRef : null}
                    >
                      <p className="text-sm font-medium text-violet-500 mb-2">
                        You
                      </p>
                      {message.content}
                    </div>
                  );
              }
            })}
            {loading && (
              <div ref={lastMessageRef} className="flex gap-2">
                <img
                  src="images/assistant-avatar.png"
                  className="h-12 w-12 rounded-full"
                />
                <div className="w-auto max-w-xl break-words bg-white rounded-b-xl rounded-tr-xl text-black p-6 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]">
                  <p className="text-sm font-medium text-violet-500 mb-4">
                    Scalably AI Assistant
                  </p>
                  <LoadingDots />
                </div>
              </div>
            )}
          </div>

          {/* input area */}
          <div className="flex sticky bottom-0 w-full px-6 pb-6 h-24">
            <div className="w-full relative">
              <textarea
                aria-label="chat input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="w-full h-full resize-none rounded-full border border-slate-900/10 bg-white pl-6 pr-24 py-[20px] text-base placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 shadow-[0_10px_40px_0px_rgba(0,0,0,0.15)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleClick();
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleClick();
                }}
                className="flex w-14 h-14 items-center justify-center rounded-full px-3 text-sm  bg-violet-600 font-semibold text-white hover:bg-violet-700 active:bg-violet-800 absolute right-2 bottom-2 disabled:bg-violet-100 disabled:text-violet-400"
                type="submit"
                aria-label="Send"
                disabled={!message || loading}
              >
                <Send />
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

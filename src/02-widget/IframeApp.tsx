import React from 'react'
import { ContentLoadedMessage, HeightMessage } from './messages';

export const IframeApp = () => {
  const containerNode = React.useRef<HTMLDivElement>(null)
  const [content, setContent] = React.useState<string>('')

  const sendHeightMessage = () => {
    const height = parseInt(window.getComputedStyle(document.body).marginTop) +
      document.body.getBoundingClientRect().height +
      parseInt(window.getComputedStyle(document.body).marginTop)
  
    const message: HeightMessage = { type: "widget:height", height: height }
    window.parent.postMessage(message, "*");
  }
  
  React.useEffect(() => {
    // this is to simulate dynamic content loading
    const dynamicContentTimer = setTimeout(() => {
      setContent(
        "Dynamic marketing content will be here " +
        "Dynamic marketing content will be here" +
        "Dynamic marketing content will be here"
      )
    }, 1000);

    // handle situation when for some reason content change in the future
    const resizeObserver = new ResizeObserver(() => {
        sendHeightMessage()
    });
    resizeObserver.observe(document.body);
    
    const handleResize = () => {
      sendHeightMessage()
    }
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(dynamicContentTimer)
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [])

  React.useEffect(() => {
    if (content) {
      const message: ContentLoadedMessage = { type: "widget:content_loaded"}
      window.parent.postMessage(message, "*");
    }
  }, [content])

  return (
    <div
      ref={containerNode}
      style={{
        backgroundColor: 'rebeccapurple',
        color: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        fontSize: '2rem',
      }}
    >
      {content}
    </div>
  )
}

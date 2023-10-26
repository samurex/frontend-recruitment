import React from 'react'

import './widget.css'
import { ContentLoadedMessage, HeightMessage } from './messages'

// hardcoded for now, should be stored in env
const allowdOrigins = [
  'http://localhost:3000',
]

export const Widget = () => {
  const [width, setWidth] = React.useState(0)
  const [height, setHeight] = React.useState(0)
  const [loaded, setLoaded] = React.useState(false)

  const iframeContainer = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (iframeContainer.current) {
      setWidth(iframeContainer.current.getBoundingClientRect().width)
    }

    const messageHandler = (event: MessageEvent<HeightMessage | ContentLoadedMessage>) => {
      if (allowdOrigins.includes(event.origin)) {
        if (event.data.type === 'widget:height') {
          setHeight(event.data.height)
        }
        if (event.data.type === 'widget:content_loaded') {
          setLoaded(true)
        }
      }
    }
    window.addEventListener("message", messageHandler, false)

    const handleResize = () => {
      if (iframeContainer.current) {
        setWidth(iframeContainer.current.getBoundingClientRect().width)
      }
    }
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener("message", messageHandler)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="widget" style={{visibility: loaded ? 'visible' : 'hidden'}}>
      <h1>App content</h1>
      <p>Check out our latest podcast</p>
      <div
        ref={iframeContainer}
        style={{
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <iframe
          height={height}
          width={width}
          src="/iframe"
          style={{ border: 0 }}
        />
      </div>
    </div>
  )
}

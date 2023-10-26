import React from 'react'
import { PillData } from './data'
import { Pill } from './Pill'

interface PillsProps {
  pills: PillData[]
  headers: string[] // ids of pills that are toggled on
  toggleHeader: (id: string) => void
}

interface LayoutBreakElement {
  index: string
  type: 'line-break'
}

interface LayoutPillElement {
  index: string
  type: 'pill'
  pill: PillData
}

type LayoutElement = LayoutBreakElement | LayoutPillElement

// this is not optimal, but I think is good enough, in order to achieve better results one of the offline bin packing algorithms can be used
function firstFit(pillsWidth: Map<string, number>, lineWidth: number, pillData: PillData[]): PillData[][] {
  const bins: { width: number, pills: PillData[] }[] = [{ width: 0, pills: [] }]
  for (const pill of pillData) {
    const width = pillsWidth.get(pill.id) || 0
    let added = false
    for (const bin of bins) {
      if (bin.width + width <= lineWidth) {
        bin.width += width
        bin.pills.push(pill)
        added = true;
        break;
      }
    }
    if (!added) {
      bins.push({ width, pills: [pill] })
    }
  }
  return bins.map(line => line.pills)
}

function createLayout(pillsWidth: Map<string, number>, lineWidth: number, pillData: PillData[]) {
  const bins = firstFit(pillsWidth, lineWidth, pillData)

  const newLayoutElements: LayoutElement[] = []
  for (let i = 0; i < bins.length; ++i) {
    for (const pill of bins[i]) {
      newLayoutElements.push({
        index: pill.id,
        type: 'pill',
        pill: pill,
      })
    }
    if (i < bins.length - 1) {
      newLayoutElements.push({
        index: i.toString(),
        type: 'line-break',
      })
    }
  }
  return newLayoutElements
}

export function Pills({ pills, headers, toggleHeader }: PillsProps) {
  const containerNode = React.useRef<HTMLDivElement>(null)
  const pillRefs = React.useRef<{ [id: PillData['id']]: HTMLDivElement }>({})

  const [layoutElements, setLayoutElements] = React.useState<LayoutElement[]>(() => {
    return pills.map(pill => ({
      index: pill.id,
      type: 'pill',
      pill: pill,
    }))
  })

  // initially make all headers visible in order to calculate the max width of the pills
  const [localHeaders, setLocalHeaders] = React.useState<string[]>(() => {
    return pills.map(pill => pill.id)
  })
  React.useEffect(() => {
    setLocalHeaders(headers)
  }, [headers])

  const [containerWidth, setContainerWidth] = React.useState<number>(0)
  const [pillsWidth, setPillsWidth] = React.useState<Map<string, number>>(() => new Map<string, number>())

  React.useLayoutEffect(() => {
    if (containerNode.current) {
      setContainerWidth(containerNode.current.getBoundingClientRect().width)
    }
   
    const pillWidths = new Map<string, number>()
    for (let {id} of pills) {
      pillWidths.set(id, pillRefs.current[id].getBoundingClientRect().width)
    }
    setPillsWidth(pillWidths)
    setLocalHeaders(headers)

    const handleResize = () => {
      if (containerNode.current) {
        setContainerWidth(containerNode.current.getBoundingClientRect().width)
      }
    }
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  React.useLayoutEffect(() => {
    setLayoutElements(createLayout(pillsWidth, containerWidth, pills))
  }, [pills, pillsWidth, containerWidth])

  const setPillRef = (id: PillData['id'], node: HTMLDivElement) => {
    if (node) {
      pillRefs.current[id] = node
    }
  }

  return (
    <div ref={containerNode}>
      {layoutElements.map(el => {
        if (el.type === 'line-break') {
          return <br key={`__${el.type}-${el.index}`} />
        } else {
          return (
            <Pill
              key={el.pill.id}
              header={localHeaders.includes(el.pill.id)}
              onClick={() => {
                toggleHeader(el.pill.id)
              }}
              ref={element => element && setPillRef(el.pill.id, element)}
            >
              {el.pill.value}
            </Pill>
          )
        }
      })}
    </div>
  )
}

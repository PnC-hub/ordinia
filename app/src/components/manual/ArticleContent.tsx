'use client'

import React from 'react'

function transformUrl(tag: 'img' | 'video', url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveMatch) {
    const id = driveMatch[1]
    if (tag === 'img') return `https://drive.google.com/uc?export=view&id=${id}`
    return `https://drive.google.com/file/d/${id}/preview`
  }

  return url
}

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const nodes = content.split('\n').map((line, i) => {
    const imgMatch = line.match(/^\[img:(.+)\]$/)
    if (imgMatch) {
      const src = transformUrl('img', imgMatch[1].trim())
      return (
        <a key={i} href={src} target="_blank" rel="noreferrer" className="block my-2">
          <img src={src} alt="" className="max-w-full rounded" />
        </a>
      )
    }

    const videoMatch = line.match(/^\[video:(.+)\]$/)
    if (videoMatch) {
      const src = transformUrl('video', videoMatch[1].trim())
      return (
        <div key={i} className="my-4 relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={src}
            className="absolute top-0 left-0 w-full h-full rounded"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }

    return <p key={i} className="whitespace-pre-wrap">{line || '\u00A0'}</p>
  })

  return <div className="space-y-1">{nodes}</div>
}

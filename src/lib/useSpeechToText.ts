import { useCallback, useEffect, useRef, useState } from "react"

// 浏览器自带语音识别（Web Speech API）：不额外联网调用、不产生费用。
// 可用性取决于浏览器（Chrome/Edge/部分国产浏览器支持）；不支持时调用方隐藏入口即可。

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0?: { transcript: string }
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: Event & { error?: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface UseSpeechToTextOptions {
  /** 识别出一整句（最终结果）时回调，建议追加到输入内容 */
  onFinal: (transcript: string) => void
  /** 实时中间结果（空串 = 当前没有未定稿文字） */
  onInterim?: (interim: string) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

export function useSpeechToText(options: UseSpeechToTextOptions) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  // 回调经 ref 透传，识别事件里永远拿到最新闭包（避免追加时用了旧的输入内容）
  const optRef = useRef(options)
  optRef.current = options

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null)
  }, [])

  const stop = useCallback(() => {
    recRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    if (recRef.current) return
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = "zh-CN"
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        const text = (result[0]?.transcript ?? "").trim()
        if (!text) continue
        if (result.isFinal) optRef.current.onFinal(text)
        else interim += text
      }
      optRef.current.onInterim?.(interim)
    }
    rec.onerror = (e) => {
      const code = e.error
      if (code === "aborted") return
      const message =
        code === "not-allowed" || code === "service-not-allowed"
          ? "麦克风权限被拒绝，请在浏览器设置里允许后重试"
          : code === "no-speech"
            ? "没有听到声音，靠近一点再试试"
            : code === "network"
              ? "语音识别服务连不上，请检查网络"
              : "语音识别出了点问题，请再试一次"
      optRef.current.onError?.(message)
    }
    rec.onend = () => {
      recRef.current = null
      setListening(false)
      optRef.current.onInterim?.("")
      optRef.current.onEnd?.()
    }
    recRef.current = rec
    setListening(true)
    try {
      rec.start()
    } catch {
      recRef.current = null
      setListening(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (recRef.current) stop()
    else start()
  }, [start, stop])

  // 组件卸载时中止识别，避免后台偷听
  useEffect(() => {
    return () => {
      recRef.current?.abort()
      recRef.current = null
    }
  }, [])

  return { supported, listening, start, stop, toggle }
}

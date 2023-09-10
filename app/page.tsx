'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Settings } from '@/components/icons/Settings'
import { useInterval } from 'ahooks'
import { produce } from 'immer'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function Home() {
  const models = [
    {
      id: '601420727112962175',
      name: 'Cartoon',
      modelName: 'Dark Sushi',
      src: '/models/cartoon.jpg',
    },
    // {
    //   id: '605430856472889767',
    //   name: '3D',
    //   modelName: 'Cute 3D',
    //   src: '/models/3d.jpeg',
    // },
    {
      id: '603003048899406426',
      name: 'Realistic',
      modelName: 'majicMIX realistic',
      src: '/models/realistic.jpeg',
    },
    // {
    //   id: '613021712969275555',
    //   name: 'Chinese Tradtional Style',
    //   modelName: 'You Si Miao',
    //   src: '/models/chinese_traditional_style.jpeg',
    // },
  ]

  const [messages, setMessages] = useState<
    { content: string; type: 'success' | 'error' | 'info'; timestamp: number }[]
  >([])

  const [url, setUrl] = useState('')
  const [weight, setWeight] = useState('')
  const [prompt, setPrompt] = useState('')
  const [selectedModelId, setSelectedModelId] = useState(models[0].id)
  const [secretInited, setSecretInited] = useState(false)
  const [historyInited, setHistoryInited] = useState(false)
  const isInited = useRef(false)
  const [secret, setSecret] = useLocalStorage('APP_SECRET', '', {
    onSet: () => {
      setSecretInited(true)
    },
  })
  const [history, setHistory] = useLocalStorage<
    { id: string; status: string; url?: string }[]
  >('HISTORY', [], {
    onSet: () => {
      setHistoryInited(true)
    },
  })

  useEffect(() => {
    if (secretInited && historyInited && !isInited.current) {
      isInited.current = true
      history.forEach((h) => {
        if (h.status === 'SUCCESS') {
          fetch(`/api/job/${h.id}`, {
            headers: {
              authorization: `Bearer ${secret}`,
            },
          })
            .then((res) => res.json())
            .then(
              (res: {
                id: string
                status: string
                successInfo: { images: { url: string }[] }
              }) => {
                setHistory((history) => {
                  return produce(history!, (draftHistory) => {
                    const index = draftHistory.findIndex((h) => h.id === res.id)
                    if (index > -1) {
                      draftHistory[index].status = res.status
                      draftHistory[index].url = res.successInfo.images[0].url
                    }
                  })
                })
              },
            )
        }
      })
    }
  }, [secret, history, secretInited, historyInited])

  async function handleGenerate() {
    try {
      if (Number.isNaN(+weight) || +weight <= 0) {
        setMessages((messages) => {
          return produce(messages, (draftMessages) => {
            draftMessages.unshift({
              content: 'Weight must be a number greater than zero',
              timestamp: Date.now(),
              type: 'error',
            })
          })
        })
        return
      }

      const resp = await fetch('/api/qrcode/generate', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
          url,
          weight: +weight,
          prompt: prompt,
          modelId: selectedModelId,
        }),
      })

      if (!resp.ok) {
        const json = (await resp.json()) as { message: string }
        setMessages((messages) => {
          return produce(messages, (draftMessages) => {
            draftMessages.unshift({
              content: json.message,
              timestamp: Date.now(),
              type: 'error',
            })
          })
        })
        return
      }

      const json = (await resp.json()) as { id: string; status: string }
      if (json.id) {
        setHistory((history) => {
          return produce(history!, (draftHistory) => {
            draftHistory.unshift(json)
          })
        })
      }
    } catch (err) {}
  }

  useInterval(
    () => {
      ;(history ?? [])
        .filter((history) =>
          ['CREATED', 'PENDING', 'RUNNING', 'WAITING'].includes(history.status),
        )
        .forEach((h) => {
          fetch(`/api/job/${h.id}`, {
            headers: {
              authorization: `Bearer ${secret}`,
            },
          })
            .then((res) => res.json())
            .then(
              (res: {
                id: string
                status: string
                successInfo: { images: { url: string }[] }
              }) => {
                if (['CANCELED', 'SUCCESS', 'FAILED'].includes(res.status)) {
                  setHistory((history) => {
                    return produce(history!, (draftHistory) => {
                      const index = draftHistory.findIndex(
                        (h) => h.id === res.id,
                      )
                      if (index > -1) {
                        draftHistory[index].status = res.status
                        draftHistory[index].url = res.successInfo.images[0].url
                      }
                    })
                  })
                }
              },
            )
        })
    },
    5 * 1000,
    {
      immediate: true,
    },
  )

  useInterval(() => {
    setMessages((msgs) => {
      return msgs.filter((msg) => {
        if (Date.now() - msg.timestamp > 2 * 1000) {
          return false
        }
        return true
      })
    })
  }, 100)

  return (
    <main className="flex gap-4">
      <div className="bg-white rounded-lg overflow-hidden relative shadow">
        <div className="h-[calc(100vh-64px)] overflow-y-scroll py-4 px-6 pb-[100px]">
          <div className="text-lg font-semibold mb-2">🪄 Workspace</div>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">URL</span>
            </label>
            <input
              type="text"
              placeholder="Please enter URL"
              className="input input-bordered w-full max-w-xs"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Weight</span>
            </label>
            <input
              type="text"
              placeholder="Please enter weight (eg. 2)"
              className="input input-bordered w-full max-w-xs"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">
                The larger the weight value, the easier it is for the QR code to
                be scanned, but the artistic quality may decrease
              </span>
            </label>
          </div>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Style</span>
            </label>
            <div>
              {models.map((m) => (
                <div
                  key={m.id}
                  className={clsx(
                    'flex items-center border-2 border-solid rounded-lg cursor-pointer p-2',
                    {
                      'border-primary': selectedModelId === m.id,
                      'border-transparent': selectedModelId !== m.id,
                    },
                  )}
                  onClick={() => setSelectedModelId(m.id)}
                >
                  <div className="rounded w-12 h-12 bg-gray-300 mr-2 overflow-hidden">
                    <Image src={m.src} width="48" height="48" alt="" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {m.name}
                    </div>
                    <div className="text-sm text-slate-500">{m.modelName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Prompt</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Please enter prompt (eg. 1girl, sitting on the chair)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="flex items-center border-t border-gray-200 absolute bottom-0 left-0 right-0 bg-white px-6 py-4">
          {secret ? (
            <button
              className="btn btn-primary flex-auto mr-2"
              onClick={handleGenerate}
            >
              Generate
            </button>
          ) : (
            <div
              className="tooltip flex-auto mr-2"
              data-tip="Please click the settings button on the right to configure the secret first."
            >
              <button className="btn btn-primary btn-disabled w-full">
                Generate
              </button>
            </div>
          )}
          <div className="dropdown dropdown-top dropdown-end">
            <label tabIndex={0} className="btn">
              <div className="text-2xl cursor-pointer">
                <Settings />
              </div>
            </label>
            <div
              tabIndex={0}
              className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-[300px] mb-2"
            >
              <input
                type="text"
                placeholder="Please enter your secret"
                className="input input-bordered w-full max-w-xs"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg overflow-hidden relative shadow">
        <div className="w-[300px] h-[calc(100vh-64px)] p-4 overflow-y-scroll">
          <div className="text-lg font-semibold mb-2">📌 History</div>
          <div className="text-xs mb-2">
            The history will only be saved locally. Clearing the cache will
            result in losing the history.
          </div>
          {history!.length === 0 ? (
            <div className="h-full text-gray-500 flex items-center justify-center">
              No history yet
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {history!.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="bg-gray-100 rounded-lg aspect-square overflow-hidden flex items-center justify-center"
                  >
                    {item.url ? (
                      <img src={item.url} alt="" />
                    ) : (
                      <span className="text-gray-500">Loading</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="toast toast-bottom toast-end">
        {messages.map((msg) => (
          <div
            key={msg.timestamp}
            className={clsx('alert', {
              'alert-success': msg.type === 'success',
              'alert-info': msg.type === 'info',
              'alert-error': msg.type === 'error',
            })}
          >
            <span>{msg.content}</span>
          </div>
        ))}
      </div>
    </main>
  )
}

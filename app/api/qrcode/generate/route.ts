import { tamsSDK } from '@/service/tams'
import { NextRequest, NextResponse } from 'next/server'
import * as uuid from 'uuid'
import qrcode from 'qrcode'
import { t } from 'tams-sdk'

const defaultParams = {
  '601420727112962175': {
    sampler: 'DPM++ 2M Karras',
    sdVae: '',
    denoisingStrength: 0.5,
    etaNoiseSeedDelta: 31337,
    sdModel: '601420727112962175',
    steps: 20,
    cfgScale: 10,
    clipSkip: 2,
    negativePrompts: [
      {
        text: 'sketch',
      },
      {
        text: 'duplicate',
      },
      {
        text: 'ugly',
      },
      {
        text: 'huge eyes',
      },
      {
        text: 'text',
      },
      {
        text: 'logo',
      },
      {
        text: 'monochrome',
      },
      {
        text: 'worst face',
      },
      {
        text: '(bad and mutated hands:1.3)',
      },
      {
        text: '(worst quality:2.0)',
      },
      {
        text: '(low quality:2.0)',
      },
      {
        text: '(blurry:2.0)',
      },
      {
        text: 'horror',
      },
      {
        text: 'geometry',
      },
      { text: 'bad_prompt' },
      { text: '(bad hands)' },
      { text: '(missing fingers)' },
      { text: 'multiple limbs' },
      { text: 'bad anatomy' },
      { text: '(interlocked fingers:1.2)' },
      { text: 'Ugly Fingers' },
      { text: '(extra digit and hands and fingers and legs and arms:1.4)' },
      { text: '((2girl))' },
      { text: '(deformed fingers:1.2)' },
      { text: '(long fingers:1.2)' },
      { text: '(bad-artist-anime)' },
      { text: 'bad-artist' },
      { text: 'bad hand' },
      { text: 'extra legs' },
    ],
  },
  '603003048899406426': {
    sampler: 'Euler',
    sdVae: '',
    denoisingStrength: 0.12,
    etaNoiseSeedDelta: 0,
    sdModel: '603003048899406426',
    steps: 30,
    cfgScale: 7,
    clipSkip: 2,
    negativePrompts: [
      {
        text: 'nsfw',
      },
      {
        text: 'ng_deepnegative_v1_75t',
      },
      {
        text: 'badhandv4',
      },
      {
        text: '(worst quality:2)',
      },
      {
        text: '(low quality:2)',
      },
      {
        text: '(normal quality:2)',
      },
      {
        text: 'lowres',
      },
      {
        text: 'watermark',
      },
      {
        text: 'monochrome',
      },
    ],
  },
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    url: string
    weight: number
    prompt: string
    modelId: string
  }

  if (!body.url) {
    return NextResponse.json(
      {
        message: 'Please enter URL',
      },
      { status: 400 },
    )
  }

  if (!body.weight) {
    return NextResponse.json(
      {
        message: 'Please enter weight',
      },
      { status: 400 },
    )
  }

  if (!body.prompt) {
    return NextResponse.json(
      {
        message: 'Please enter prompt',
      },
      { status: 400 },
    )
  }

  const qrcodeContent = await qrcode.toBuffer(body.url, {
    width: 640,
    margin: 0,
  })

  const { resourceId } = await tamsSDK.uploadFile({
    file: qrcodeContent,
  })

  const createJobBody: t.TamsApiCreateJobRequest = {
    requestId: uuid.v4(),
    stages: [
      {
        type: t.TamsApiStageTypeT.INPUT_INITIALIZE,
        inputInitialize: {
          seed: '-1',
          count: 1,
        },
      },
      {
        type: t.TamsApiStageTypeT.DIFFUSION,
        diffusion: {
          width: 640,
          height: 640,
          prompts: [
            {
              text: body.prompt,
            },
          ],
          controlnet: {
            args: [
              {
                model: 'control_v1p_sd15_qrcode_monster',
                weight: body.weight,
                inputImageResourceId: resourceId,
                preprocessor: 'none',
              },
            ],
          },
          ...defaultParams[body.modelId as keyof typeof defaultParams],
        },
      },
    ],
  }

  const createJobResp =
    await tamsSDK.v1.tamsApiV1ServiceCreateJob(createJobBody)
  return NextResponse.json(createJobResp.data.job ?? {})
}

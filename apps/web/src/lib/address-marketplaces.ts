import parsePhoneNumber from 'libphonenumber-js'

export const MARKETPLACE_SLUGS = [
  'pinduoduo',
  'taobao',
  'poizon',
  '1688',
  'wechat',
] as const

export type MarketplaceSlug = (typeof MARKETPLACE_SLUGS)[number]

export interface MarketplaceAddressInput {
  clientId: number
  clientName: string
  phoneNumber?: string | null
}

export interface MarketplaceConfig {
  slug: MarketplaceSlug
  name: string
  screenshotUrls?: string[]
  noteKey?: 'wechatInvoiceNote'
  formatAddress: (input: MarketplaceAddressInput) => string[]
  logoUrl: string
}

function formatMarketplacePhoneNumber(phoneNumber?: string | null): string {
  if (!phoneNumber) {
    return ''
  }

  const parsedPhoneNumber = parsePhoneNumber(phoneNumber)

  if (parsedPhoneNumber) {
    return parsedPhoneNumber.nationalNumber
  }

  return phoneNumber.replace(/\D/g, '')
}

function formatPinduoduoAddress({
  clientId,
  clientName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName}`

  return [
    `JL7182-${clientId}`,
    '13661225513',
    '',
    '广东省',
    '佛山市',
    '南海区',
    '',
    recipientLine,
  ]
}

function formatTaobaoAddress({
  clientId,
  clientName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName}`

  return [
    '广东省',
    '佛山市',
    '南海区',
    '里水镇',
    '',
    recipientLine,
    '',
    `JL7182-${clientId}`,
    '13661225513',
  ]
}

function formatPoizonAddress({
  clientId,
  clientName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName}`

  return [
    `JL7182-${clientId}`,
    '13661225513',
    '',
    '广东省',
    '佛山市',
    '南海区',
    '里水镇',
    '',
    recipientLine,
  ]
}

function format1688Address({
  clientId,
  clientName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName}`

  return [
    `JL7182-${clientId}`,
    '13661225513',
    '',
    '广东省',
    '佛山市',
    '南海区',
    '里水镇',
    '',
    recipientLine,
  ]
}

function formatWeChatAddress({
  clientId,
  clientName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientId} ${clientName}`

  return [
    `JL7182-${clientId}`,
    '13661225513',
    '',
    '广东省',
    '佛山市',
    '南海区',
    '',
    recipientLine,
  ]
}

const PINDUODUO_CONFIG: MarketplaceConfig = {
  slug: 'pinduoduo',
  name: 'Pinduoduo',
  screenshotUrls: [
    '/example-screenshots/pinduoduo/1.jpg',
    '/example-screenshots/pinduoduo/2.jpg',
  ],
  formatAddress: formatPinduoduoAddress,
  logoUrl: '/marketplace-logos/pinduoduo.png',
}

const TAOBAO_CONFIG: MarketplaceConfig = {
  slug: 'taobao',
  name: 'Taobao',
  screenshotUrls: [
    '/example-screenshots/taobao/1.jpg',
    '/example-screenshots/taobao/2.jpg',
  ],
  formatAddress: formatTaobaoAddress,
  logoUrl: '/marketplace-logos/taobao.png',
}

const POIZON_CONFIG: MarketplaceConfig = {
  slug: 'poizon',
  name: 'Poizon',
  screenshotUrls: [
    '/example-screenshots/poizon/1.jpg',
    '/example-screenshots/poizon/2.jpg',
  ],
  formatAddress: formatPoizonAddress,
  logoUrl: '/marketplace-logos/poizon.png',
}

const _1688_CONFIG: MarketplaceConfig = {
  slug: '1688',
  name: '1688',
  screenshotUrls: [
    '/example-screenshots/1688/1.jpg',
    '/example-screenshots/1688/2.jpg',
  ],
  formatAddress: format1688Address,
  logoUrl: '/marketplace-logos/1688.png',
}

const WECHAT_CONFIG: MarketplaceConfig = {
  slug: 'wechat',
  name: 'WeChat',
  noteKey: 'wechatInvoiceNote',
  formatAddress: formatWeChatAddress,
  logoUrl: '/marketplace-logos/wechat.png',
}

export const MARKETPLACES: MarketplaceConfig[] = [
  PINDUODUO_CONFIG,
  TAOBAO_CONFIG,
  POIZON_CONFIG,
  _1688_CONFIG,
  WECHAT_CONFIG,
]

export const MARKETPLACES_BY_SLUGS: Record<MarketplaceSlug, MarketplaceConfig> =
  {
    pinduoduo: PINDUODUO_CONFIG,
    taobao: TAOBAO_CONFIG,
    poizon: POIZON_CONFIG,
    '1688': _1688_CONFIG,
    wechat: WECHAT_CONFIG,
  }

export function isMarketplaceSlug(slug: string): slug is MarketplaceSlug {
  return MARKETPLACE_SLUGS.includes(slug as MarketplaceSlug)
}

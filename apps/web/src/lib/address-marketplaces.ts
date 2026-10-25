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
  clientCode: number
  userName: string
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

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ё: 'E',
  Ж: 'Zh',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'Kh',
  Ц: 'Ts',
  Ч: 'Ch',
  Ш: 'Sh',
  Щ: 'Shch',
  Ъ: '',
  Ы: 'Y',
  Ь: '',
  Э: 'E',
  Ю: 'Yu',
  Я: 'Ya',
  Ә: 'A',
  Ғ: 'G',
  Қ: 'Q',
  Ң: 'N',
  Ө: 'O',
  Ұ: 'U',
  Ү: 'U',
  Һ: 'H',
  І: 'I',
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ә: 'a',
  ғ: 'g',
  қ: 'q',
  ң: 'n',
  ө: 'o',
  ұ: 'u',
  ү: 'u',
  һ: 'h',
  і: 'i',
}

export function cyrillicToLatin(text: string): string {
  return text
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
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
  clientCode,
  userName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)
  const latinUserName = cyrillicToLatin(userName)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName}`

  return [
    `JL7182-${clientCode}`,
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
  clientCode,
  userName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)
  const latinUserName = cyrillicToLatin(userName)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName}`

  return [
    '广东省',
    '佛山市',
    '南海区',
    '里水镇',
    '',
    recipientLine,
    '',
    `JL7182-${clientCode}`,
    '13661225513',
  ]
}

function formatPoizonAddress({
  clientCode,
  userName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)
  const latinUserName = cyrillicToLatin(userName)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName}`

  return [
    `JL7182-${clientCode}`,
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
  clientCode,
  userName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)
  const latinUserName = cyrillicToLatin(userName)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName}`

  return [
    `JL7182-${clientCode}`,
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
  clientCode,
  userName,
  phoneNumber,
}: MarketplaceAddressInput): string[] {
  const clientPhoneNumber = formatMarketplacePhoneNumber(phoneNumber)
  const latinUserName = cyrillicToLatin(userName)

  const recipientLine = clientPhoneNumber
    ? `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName} ${clientPhoneNumber}`
    : `里水镇沙涌社区上沙村松元路2号F栋 158库JL7182-${clientCode} ${latinUserName}`

  return [
    `JL7182-${clientCode}`,
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

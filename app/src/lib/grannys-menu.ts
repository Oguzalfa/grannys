export type Category = 'waffle' | 'bowl' | 'box' | 'kumpir'

export type Option = {
  id: string
  name: string
  description?: string
  price?: number
  image?: string
  color?: string
}

export type Product = {
  id: Category
  name: string
  title: string
  description: string
  price: number
  photo: string
  options: Option[]
}

export type Selection = Record<string, string[]>

export type MenuStep = {
  id: string
  label: string
  title: string
  description: string
  limit: number | null
  options: Option[]
}

export type MenuItem = { name: string; price: number; description?: string }

export type CatalogueItem = {
  description: string
  id: string
  name: string
  category: Category
  price: number
  portion?: string
  coreIngredients: string[]
  selectableIngredients: string[]
  recipeNote?: string
  recipeCertainty?: 'printed-reference' | 'brand-general' | 'branch-reference' | 'branch-conflict' | 'target-pending'
  recipeSourceUrls?: string[]
  configurable: boolean
  baseId?: string
}

export type ReferenceNote = {
  id: string
  sourceUrl?: string
  note: string
}


const ingredient = (name: string) => `/assets/ingredients/${name}.webp`

export const products: Product[] = [
  {
    id: 'waffle',
    name: 'Waffle',
    title: 'Granny’s Waffle',
    description: 'Çıtır taban. Bol çikolata. Tam senlik.',
    price: 390,
    photo: '/assets/products/waffle.webp',
    options: [
      { id: 'granny-waffle', name: 'Granny’s Waffle', description: 'İnce papatya hamuru', price: 390, image: '/assets/products/waffle.webp' },
      { id: 'brussels-waffle', name: 'Brüksel Waffle', description: 'Çıtır, kalın hamur', price: 390, image: '/assets/products/waffle.webp' },
      { id: 'brussels-large', name: 'Brüksel Waffle Büyük Boy', description: 'Daha büyük bir mutluluk', price: 490, image: '/assets/products/waffle.webp' },
    ],
  },
  {
    id: 'bowl',
    name: 'Bowl',
    title: 'Waffle Bowl',
    description: 'Kaşık kaşık çikolata mutluluğu.',
    price: 390,
    photo: '/assets/products/bowl.webp',
    options: [
      { id: 'waffle-bowl', name: 'Waffle Bowl · Orta Boy', description: 'Çıtır waffle parçaları', price: 390, image: '/assets/products/bowl.webp' },
      { id: 'waffle-bowl-large', name: 'Waffle Bowl L', description: 'Büyük boy', price: 490, image: '/assets/products/bowl.webp' },
    ],
  },
  {
    id: 'box',
    name: 'Box',
    title: 'Granny’s Box',
    description: 'Paylaşınca daha güzel.',
    price: 850,
    photo: '/assets/products/box.webp',
    options: [
      { id: 'box-two', name: 'Granny’s Box · 2 kişilik', description: 'İki kişilik tatlı bir mola', price: 850, image: '/assets/products/box.webp' },
    ],
  },
  {
    id: 'kumpir',
    name: 'Kumpir',
    title: 'Granny’s Kumpir',
    description: 'Sıcacık. Dolu dolu. Senin seçiminle.',
    price: 450,
    photo: '/assets/products/kumpir.webp',
    options: [
      { id: 'plain-kumpir', name: 'Sade Kumpir', description: 'Malzeme kapsamı ve farkları şubede teyit edilir', price: 370, image: '/assets/products/kumpir.webp' },
      { id: 'granny-kumpir', name: 'Granny’s Kumpir', description: 'Sevdiğin malzemelerle', price: 450, image: '/assets/products/kumpir.webp' },
      { id: 'grandma-kumpir', name: 'Büyükanne Kumpir', description: 'Doyurucu bir mola', price: 520, image: '/assets/products/kumpir.webp' },
      { id: 'kumpir-box', name: 'Kumpir Box', description: 'Kutuda sıcacık mutluluk', price: 550, image: '/assets/products/kumpir.webp' },
    ],
  },
]

export const chocolates: Option[] = [
  { id: 'milk', name: 'Sütlü çikolata', description: 'Yumuşak ve klasik', color: '#78402A', image: ingredient('chocolate') },
  { id: 'white', name: 'Beyaz çikolata', description: 'Kremsi ve tatlı', color: '#F0DDA8', image: ingredient('chocolate') },
  { id: 'dark', name: 'Bitter çikolata', description: 'Yoğun çikolata lezzeti', color: '#38231D', image: ingredient('chocolate') },
  { id: 'hazelnut-chocolate', name: 'Fındıklı çikolata', description: 'Kavrulmuş fındık dokunuşu', color: '#A06B45', image: ingredient('chocolate') },
  { id: 'strawberry-chocolate', name: 'Çilekli çikolata', description: 'Meyvemsi ve pembe', color: '#DD7694', image: ingredient('chocolate') },
  { id: 'pistachio', name: 'Antep fıstıklı çikolata', description: 'Fıstığın tatlı hali', color: '#8D994D', image: ingredient('chocolate') },
  { id: 'caramel', name: 'Karamelli çikolata', description: 'Karamelin sıcak lezzeti', color: '#BD7B38', image: ingredient('chocolate') },
  { id: 'raspberry', name: 'Frambuazlı çikolata', description: 'Tatlı ve hafif ekşi', color: '#A93761', image: ingredient('chocolate') },
]

export const fruits: Option[] = [
  { id: 'strawberry', name: 'Çilek', description: 'Taptaze bir dokunuş', image: ingredient('strawberry') },
  { id: 'banana', name: 'Muz', description: 'Tatlı bir klasik', image: ingredient('banana') },
  { id: 'kiwi', name: 'Kivi', description: 'Ferah ve hafif ekşi', image: ingredient('kiwi') },
  { id: 'pineapple', name: 'Ananas', description: 'Tropik bir lezzet', image: ingredient('pineapple') },
]

export const toppings: Option[] = [
  { id: 'oreo', name: 'Oreo bisküvi', description: 'Çikolatalı çıtırlık', image: ingredient('cookie') },
  { id: 'coconut', name: 'Hindistan cevizi', description: 'Hafif ve aromatik', color: '#F4EEE0', image: ingredient('coconut') },
  { id: 'peanut', name: 'Kavrulmuş yer fıstığı', description: 'Kavrulmuş ve çıtır', color: '#C89A58', image: ingredient('peanut') },
  { id: 'lotus', name: 'Lotus bisküvi', description: 'Karamelli çıtırlık', color: '#BB7039', image: ingredient('lotus') },
  { id: 'hazelnut', name: 'Fındık', description: 'Kavrulmuş lezzet', color: '#AA773C', image: ingredient('hazelnut') },
  { id: 'walnut', name: 'Ceviz', description: 'Doğal ve kıtır', color: '#916440', image: ingredient('walnut') },
  { id: 'haribo', name: 'Haribo', description: 'Renkli bir dokunuş', color: '#EF7855', image: ingredient('haribo') },
]

export const specials: Option[] = [
  { id: 'milk-jam', name: 'Ev yapımı süt reçeli', description: 'İpeksi son dokunuş', color: '#B97B47', image: ingredient('chocolate') },
  { id: 'magnolia', name: 'Magnolya kreması', description: 'Kadifemsi ve hafif', color: '#F5E7B8', image: ingredient('chocolate') },
  { id: 'chestnut', name: 'Kestane şekeri', description: 'Tatlı bir klasik', color: '#82512E', image: ingredient('chestnut') },
  { id: 'brownie', name: 'Ev yapımı brownie', description: 'Yoğun çikolatalı', color: '#44241C', image: ingredient('brownie') },
]

export const savory: Option[] = [
  { id: 'corn', name: 'Mısır', description: 'Tatlı ve taze', image: ingredient('corn') },
  { id: 'pickle', name: 'Kornişon', description: 'Çıtır ve ekşi', image: ingredient('pickle') },
  { id: 'olive', name: 'Zeytin', description: 'Dengeli bir lezzet', image: ingredient('olive') },
  { id: 'carrot', name: 'Havuç', description: 'Renkli bir dokunuş', image: ingredient('carrot') },
  { id: 'cheese', name: 'Kaşar peyniri', description: 'Eriyen lezzet', image: ingredient('cheese') },
]

export const extras: Option[] = [
  { id: 'extra-cheese', name: 'Ekstra kaşar peyniri', description: '+50 ₺', price: 50, image: ingredient('cheese') },
  { id: 'extra-butter', name: 'Ekstra tereyağı', description: '+50 ₺', price: 50, color: '#EDCF7A', image: ingredient('cheese') },
]

const productFor = (category: Category): Product => {
  const product = products.find((entry) => entry.id === category)
  if (!product) throw new RangeError('Bilinmeyen ürün kategorisi.')
  return product
}

export function getSteps(category: Category): MenuStep[] {
  const product = productFor(category)
  const base: MenuStep = {
    id: 'base',
    label: category === 'box' ? 'Box' : 'Taban',
    title: {waffle: 'Papatya mı, Brüksel mi?', bowl: 'Pembe kâsen hangi boy?', box: 'İki kişilik kutunu aç.', kumpir: 'Kumpirini seç.'}[category],
    description: {
      waffle: 'Papatya ince ve çiçek biçimli. Brüksel daha kalın, çıtır ve derin gözlü.',
      bowl: 'Orta veya büyük boy pembe kâseyle başla. Çıtır waffle parçalarının üstünü birazdan sen dolduracaksın.',
      box: 'Waffle ve brownie yerlerini aldı. Ön bölmelere meyve, iki yuvarlak göze çikolata sosu seçeceksin.',
      kumpir: 'Fırın patatesin içi tereyağı ve kaşarla karışır. Önce tabanını, sonra içine girecek malzemeleri seç.',
    }[category],
    limit: 1,
    options: product.options,
  }
  const chocolateStep: MenuStep = {
    id: 'chocolate', label: category === 'box' ? 'Soslar' : 'Çikolata',
    title: category === 'box' ? 'Sos gözlerine ne koyalım?' : 'Çikolatan nasıl aksın?',
    description: category === 'box' ? 'En fazla iki sos seçebilirsin. Her biri kutudaki ayrı bir göze dolar.' : 'Tek çikolata bütün tabanı kaplar. İki çeşit seçersen yüzeyi yarı yarıya paylaşırlar.',
    limit: 2, options: chocolates,
  }
  const fruitStep: MenuStep = {
    id: 'fruit', label: 'Meyve', title: category === 'box' ? 'Meyve gözlerini doldur.' : 'Hangi meyveleri ekleyelim?',
    description: category === 'box' ? 'Çilek, muz, kivi ve ananas arasından seç. Meyvelerin kutunun ön bölmelerine yerleşir.' : 'Çilek, muz, kivi ve ananas arasından sevdiklerine dokun. Bir meyveyi kaldırmak için aynı meyveye tekrar dokun.',
    limit: null, options: fruits,
  }
  const toppingStep: MenuStep = {
    id: 'topping', label: category === 'box' ? 'Son dokunuş' : 'Süsleme',
    title: 'Üstüne ne serpelim?',
    description: category === 'box' ? 'Son dokunuşlarını seç. Box süsleme kapsamı şubede teyit edilir.' : 'Bisküvi kırıkları, fındık, ceviz… Tabağına en fazla üç süsleme serpebilirsin. Fiyata dahil.',
    limit: category === 'box' ? null : 3, options: toppings,
  }
  if (category === 'kumpir') return [
    base,
    { id: 'filling', label: 'Malzemeler', title: 'İçine neler koyalım?', description: 'İçine eklemek istediklerini seç. Dahil malzemeler ve olası fiyat farkları şubede teyit edilir.', limit: null, options: savory },
    { id: 'extras', label: 'Ekstralar', title: 'Son dokunuş senin.', description: 'Dilersen ekstra kaşar veya tereyağı ekle. Her biri +50 ₺.', limit: null, options: extras },
  ]
  if (category === 'box') return [base, fruitStep, chocolateStep, toppingStep]
  return [
    base, chocolateStep, fruitStep, toppingStep,
    { id: 'special', label: 'Spesiyal', title: 'En üste ne gelsin?', description: 'Süt reçeli, magnolya, kestane şekeri veya brownie. En fazla iki spesiyal seçebilirsin. Fiyata dahil.', limit: 2, options: specials },
  ]
}

/** Ignore unknown IDs, deduplicate, and enforce the same limits as the UI. */
function selectedOptions(step: MenuStep, selections: Selection): Option[] {
  const ids = Array.isArray(selections[step.id]) ? selections[step.id] : []
  const seen = new Set<string>()
  const selected: Option[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    const option = step.options.find((entry) => entry.id === id)
    if (option) selected.push(option)
    if (step.limit !== null && selected.length >= step.limit) break
  }
  return selected
}

function selectedBase(category: Category, selections: Selection): Option {
  const product = productFor(category)
  const baseStep = getSteps(category)[0]!
  return selectedOptions(baseStep, selections)[0]
    ?? product.options.find((option) => option.price === product.price)
    ?? product.options[0]!
}

export function getPrice(category: Category, selections: Selection): number {
  const base = selectedBase(category, selections)
  let price = base.price ?? productFor(category).price
  if (category === 'kumpir') {
    const steps = getSteps(category)
    price += selectedOptions(steps.find((step) => step.id === 'extras')!, selections)
      .reduce((sum, option) => sum + (option.price ?? 0), 0)
  }
  return price
}

export function summarize(category: Category, selections: Selection): string[] {
  return getSteps(category).flatMap((step) => step.id === 'base'
    ? [selectedBase(category, selections).name]
    : selectedOptions(step, selections).map((option) => option.name))
}

/** Catalogue transcribed from the user's printed menu; prices are in TRY. */
export const allMenu: Record<string, MenuItem[]> = {
  Waffle: [
    { name: 'Granny’s Waffle', price: 390 },
    { name: 'Büyükanne’mizin Tercihi Waffle', price: 490 },
    { name: 'Brüksel Waffle', price: 390 },
    { name: 'Brüksel Waffle (Büyük Boy)', price: 490 },
    { name: 'Sandwich Waffle', price: 390 },
    { name: 'Pankek', price: 360 },
    { name: 'Granny’s Roll', price: 490 },
  ],
  Bowl: [
    { name: 'Waffle Bowl', price: 390 },
    { name: 'Waffle Bowl L', price: 490 },
    { name: 'Brownie Bowl', price: 390 },
    { name: 'Spoonfull Bowl', price: 420 },
    { name: 'Magnolia Bowl', price: 390 },
    { name: 'Kruvasan Bowl', price: 390 },
    { name: 'Pankek Bowl', price: 390 },
  ],
  Box: [
    { name: 'Brüksel Waffle Box (2 kişilik)', price: 850 },
    { name: 'Brownie Box (2 kişilik)', price: 850 },
    { name: 'Krep Box (2 kişilik)', price: 850 },
    { name: 'Pancake Box (2 kişilik)', price: 850 },
    { name: 'Fondue Box (2 kişilik)', price: 850 },
    { name: 'Granny’s Box (2 kişilik)', price: 850 },
    { name: 'Granny’s Box (3 kişilik)', price: 1250 },
    { name: 'Granny’s Box (6 kişilik)', price: 1650 },
  ],
  Kumpir: [
    { name: 'Sade Kumpir', price: 370 },
    { name: 'Granny’s Kumpir', price: 450 },
    { name: 'Büyükanne Kumpir', price: 520 },
    { name: 'Kumpir Box', price: 550 },
    { name: 'Kumru', price: 450 },
  ],
  Ekstralar: [
    { name: 'Ekstra çikolata', price: 75, description: 'Ürününe ilave çikolata; çeşitleri şubede seçilir.' },
    { name: 'Ekstra süsleme', price: 50, description: 'Ürününe ilave süsleme seçimi.' },
    { name: 'Ekstra kumpir malzeme', price: 50, description: 'Kumpire ilave malzeme; ek ücretli seçimler şubede teyit edilir.' },
    { name: 'Ekstra kaşar peyniri', price: 50, description: 'Kumpire ek kaşar peyniri.' },
    { name: 'Ekstra tereyağı', price: 50, description: 'Kumpire ek tereyağı.' },
  ],
}



const recipePending = 'Şube reçetesi teyidi bekleniyor.'
const sweetChoices = [...chocolates, ...fruits, ...toppings, ...specials].map((option) => option.name)
const boxChoices = [...fruits, ...chocolates, ...toppings].map((option) => option.name)
const kumpirChoices = [...savory, ...extras].map((option) => option.name)
const kumpirRuleNote = 'Tereyağı ve kaşarlı patates tabanı. Malzeme kapsamı ve olası fiyat farkları şubede teyit edilir.'

/** The 27 printed products. The five printed extras remain in allMenu.Ekstralar.
 * A priced catalogue entry does not imply a verified configurable recipe.
 */
export const catalogue: CatalogueItem[] = [
  {
    "id": "granny-waffle",
    "description": "İnce papatya hamurunun üzerine çikolatanı sür, meyveni seç.",
    "name": "Granny’s Waffle",
    "category": "waffle",
    "price": 390,
    "coreIngredients": [
      "İnce papatya waffle hamuru"
    ],
    "selectableIngredients": [
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Bitter çikolata",
      "Fındıklı çikolata",
      "Çilekli çikolata",
      "Antep fıstıklı çikolata",
      "Karamelli çikolata",
      "Frambuazlı çikolata",
      "Çilek",
      "Muz",
      "Kivi",
      "Ananas",
      "Oreo bisküvi",
      "Hindistan cevizi",
      "Kavrulmuş yer fıstığı",
      "Lotus bisküvi",
      "Fındık",
      "Ceviz",
      "Haribo",
      "Ev yapımı süt reçeli",
      "Magnolya kreması",
      "Kestane şekeri",
      "Ev yapımı brownie"
    ],
    "configurable": true,
    "baseId": "granny-waffle",
    "recipeCertainty": "printed-reference"
  },
  {
    "id": "grandma-choice-waffle",
    "description": "İki kat papatya waffle, seçtiğin çikolata ve meyveyle hazırlanır.",
    "name": "Büyükanne’mizin Tercihi Waffle",
    "category": "waffle",
    "price": 490,
    "coreIngredients": [
      "Çift katlı papatya waffle hamuru"
    ],
    "selectableIngredients": [
      "Çikolata",
      "Meyve",
      "Süsleme"
    ],
    "recipeNote": "Çift katlı waffle üzerine seçilen malzemelerle hazırlanır. Şubeye özel seçenekler teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79"
    ]
  },
  {
    "id": "brussels-waffle",
    "description": "Kalın, çıtır hamurun derin gözlerine seçtiğin çikolata dolar.",
    "name": "Brüksel Waffle",
    "category": "waffle",
    "price": 390,
    "coreIngredients": [
      "Çıtır, kalın waffle hamuru"
    ],
    "selectableIngredients": [
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Bitter çikolata",
      "Fındıklı çikolata",
      "Çilekli çikolata",
      "Antep fıstıklı çikolata",
      "Karamelli çikolata",
      "Frambuazlı çikolata",
      "Çilek",
      "Muz",
      "Kivi",
      "Ananas",
      "Oreo bisküvi",
      "Hindistan cevizi",
      "Kavrulmuş yer fıstığı",
      "Lotus bisküvi",
      "Fındık",
      "Ceviz",
      "Haribo",
      "Ev yapımı süt reçeli",
      "Magnolya kreması",
      "Kestane şekeri",
      "Ev yapımı brownie"
    ],
    "configurable": true,
    "baseId": "brussels-waffle",
    "recipeCertainty": "printed-reference"
  },
  {
    "id": "brussels-large",
    "description": "Brüksel’in kalın ve çıtır hamuru, büyük boy. Meyvesini ve çikolatasını sen seçersin.",
    "name": "Brüksel Waffle",
    "category": "waffle",
    "price": 490,
    "portion": "Büyük Boy",
    "coreIngredients": [
      "Çıtır, kalın waffle hamuru"
    ],
    "selectableIngredients": [
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Bitter çikolata",
      "Fındıklı çikolata",
      "Çilekli çikolata",
      "Antep fıstıklı çikolata",
      "Karamelli çikolata",
      "Frambuazlı çikolata",
      "Çilek",
      "Muz",
      "Kivi",
      "Ananas",
      "Oreo bisküvi",
      "Hindistan cevizi",
      "Kavrulmuş yer fıstığı",
      "Lotus bisküvi",
      "Fındık",
      "Ceviz",
      "Haribo",
      "Ev yapımı süt reçeli",
      "Magnolya kreması",
      "Kestane şekeri",
      "Ev yapımı brownie"
    ],
    "configurable": true,
    "baseId": "brussels-large",
    "recipeCertainty": "printed-reference"
  },
  {
    "id": "sandwich-waffle",
    "description": "Waffle hamuru meyve ve çikolatanın üzerine katlanır.",
    "name": "Sandwich Waffle",
    "category": "waffle",
    "price": 390,
    "coreIngredients": [
      "Katlanmış waffle hamuru"
    ],
    "selectableIngredients": [
      "Meyve",
      "Çikolata"
    ],
    "recipeNote": "Meyve ve çikolata ile hazırlanır. Bazı şubelerde iç malzemeler sabit olduğundan seçimler şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-conflict",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.yemeksepeti.com/restaurant/c3gl/granny-waffles-and-kumpir-c3gl"
    ]
  },
  {
    "id": "pancake",
    "description": "Mini pankeklerin üzerinde sütlü ve beyaz çikolata, krep kırığı ve Antep fıstığı.",
    "name": "Pankek",
    "category": "waffle",
    "price": 360,
    "coreIngredients": [
      "Mini pankek",
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Krep kırığı",
      "Antep fıstığı"
    ],
    "selectableIngredients": [],
    "recipeNote": "Bazı şubelerde taze meyveli sunulur. Servis içeriği şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "granny-roll",
    "description": "Özel kremalı krep rulosu, sütlü ve beyaz çikolata, krep kırığı ve Antep fıstığıyla tamamlanır.",
    "name": "Granny’s Roll",
    "category": "waffle",
    "price": 490,
    "coreIngredients": [
      "Krep",
      "Özel krema",
      "Krep kırığı",
      "Antep fıstığı",
      "Sütlü çikolata",
      "Beyaz çikolata"
    ],
    "selectableIngredients": [],
    "recipeNote": "Krep rulo içinde hazırlanır; taze meyve kullanımı ve servis içeriği şubeye göre değişebilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "waffle-bowl",
    "description": "Pembe kâsede çıtır waffle parçalarının üstüne çikolata ve meyve seç.",
    "name": "Waffle Bowl",
    "category": "bowl",
    "price": 390,
    "portion": "Orta Boy",
    "coreIngredients": [
      "Çıtır waffle parçaları"
    ],
    "selectableIngredients": [
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Bitter çikolata",
      "Fındıklı çikolata",
      "Çilekli çikolata",
      "Antep fıstıklı çikolata",
      "Karamelli çikolata",
      "Frambuazlı çikolata",
      "Çilek",
      "Muz",
      "Kivi",
      "Ananas",
      "Oreo bisküvi",
      "Hindistan cevizi",
      "Kavrulmuş yer fıstığı",
      "Lotus bisküvi",
      "Fındık",
      "Ceviz",
      "Haribo",
      "Ev yapımı süt reçeli",
      "Magnolya kreması",
      "Kestane şekeri",
      "Ev yapımı brownie"
    ],
    "recipeNote": "Pembe servis kabında sunulur.",
    "configurable": true,
    "baseId": "waffle-bowl",
    "recipeCertainty": "printed-reference"
  },
  {
    "id": "waffle-bowl-large",
    "description": "Çıtır waffle parçaları büyük pembe kâsede. Üzerine sevdiğin çikolatayı ve meyveyi ekle.",
    "name": "Waffle Bowl L",
    "category": "bowl",
    "price": 490,
    "portion": "Büyük boy",
    "coreIngredients": [
      "Çıtır waffle parçaları"
    ],
    "selectableIngredients": [
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Bitter çikolata",
      "Fındıklı çikolata",
      "Çilekli çikolata",
      "Antep fıstıklı çikolata",
      "Karamelli çikolata",
      "Frambuazlı çikolata",
      "Çilek",
      "Muz",
      "Kivi",
      "Ananas",
      "Oreo bisküvi",
      "Hindistan cevizi",
      "Kavrulmuş yer fıstığı",
      "Lotus bisküvi",
      "Fındık",
      "Ceviz",
      "Haribo",
      "Ev yapımı süt reçeli",
      "Magnolya kreması",
      "Kestane şekeri",
      "Ev yapımı brownie"
    ],
    "recipeNote": "Pembe servis kabında sunulur.",
    "configurable": true,
    "baseId": "waffle-bowl-large",
    "recipeCertainty": "printed-reference"
  },
  {
    "id": "brownie-bowl",
    "description": "Kâsenin tabanında Belçika çikolatalı brownie parçaları var. Üstüne çikolata ve meyve seçebilirsin.",
    "name": "Brownie Bowl",
    "category": "bowl",
    "price": 390,
    "coreIngredients": [
      "Belçika çikolatalı brownie parçaları"
    ],
    "selectableIngredients": [
      "Çikolata",
      "Meyve",
      "Şekerleme",
      "Süsleme"
    ],
    "recipeNote": "Genel marka içeriğidir; şubeye özel malzemeler ve sunum değişebilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "spoonfull-bowl",
    "description": "Pastacı kremasıyla Belçika çikolatası aynı kaşıkta. Tabanı şubeye göre kek veya brownie.",
    "name": "Spoonfull Bowl",
    "category": "bowl",
    "price": 420,
    "coreIngredients": [
      "Kek veya brownie parçaları",
      "Pastacı kreması",
      "Belçika çikolatası"
    ],
    "selectableIngredients": [
      "Meyve",
      "Süsleme"
    ],
    "recipeNote": "Tabanı bazı şubelerde kek, bazılarında brownie ile hazırlanır. Şubeye özel reçete teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-conflict",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.yemeksepeti.com/restaurant/c3gl/granny-waffles-and-kumpir-c3gl",
      "https://www.yemeksepeti.com/en/restaurant/tms6/grannys-waffles-and-kumpir-tms6"
    ]
  },
  {
    "id": "magnolia-bowl",
    "description": "Magnolya kremasına bisküvi, meyve veya çikolata eşlik eder.",
    "name": "Magnolia Bowl",
    "category": "bowl",
    "price": 390,
    "coreIngredients": [
      "Magnolya kreması"
    ],
    "selectableIngredients": [
      "Bisküvi",
      "Meyve",
      "Çikolata"
    ],
    "recipeNote": "Kremalı taban, bisküvi, meyve ve çikolatayla tamamlanır. Seçenekler şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "croissant-bowl",
    "description": "Mini kruvasan parçalarını kâsede çikolata ve meyveyle bir araya getir.",
    "name": "Kruvasan Bowl",
    "category": "bowl",
    "price": 390,
    "coreIngredients": [
      "Mini kruvasan parçaları"
    ],
    "selectableIngredients": [
      "Çikolata",
      "Meyve",
      "Şekerleme",
      "Süsleme"
    ],
    "recipeNote": "Genel marka içeriğidir; şubeye özel malzemeler ve sunum değişebilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "pancake-bowl",
    "description": "Mini pankekleri kâsede çikolata, meyve veya şekerlemeyle tamamla.",
    "name": "Pankek Bowl",
    "category": "bowl",
    "price": 390,
    "coreIngredients": [
      "Mini pankekler"
    ],
    "selectableIngredients": [
      "Çikolata",
      "Meyve",
      "Şekerleme",
      "Süsleme"
    ],
    "recipeNote": "Genel marka içeriğidir; şubeye özel malzemeler ve sunum değişebilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "brussels-box",
    "description": "Brüksel waffle parçalarını muz ve çilekle birlikte çikolata sosuna batır.",
    "name": "Brüksel Waffle Box",
    "category": "box",
    "price": 850,
    "portion": "2 kişilik",
    "coreIngredients": [
      "Brüksel waffle parçaları",
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Waffle ve meyveler ayrı soslarla sunulur. Çikolata çeşitleri ve servis içeriği şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79"
    ]
  },
  {
    "id": "brownie-box",
    "description": "Belçika çikolatalı brownie ve yanında çikolata sosu. Eşlik eden meyve şubeye göre değişir.",
    "name": "Brownie Box",
    "category": "box",
    "price": 850,
    "portion": "2 kişilik",
    "coreIngredients": [
      "Belçika çikolatalı brownie",
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Meyve içeriği şubeye göre değişebilir; brownie ve çikolata sosu ortak içeriktir.",
    "configurable": false,
    "recipeCertainty": "branch-conflict",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79",
      "https://www.yemeksepeti.com/restaurant/c3gl/granny-waffles-and-kumpir-c3gl"
    ]
  },
  {
    "id": "crepe-box",
    "description": "Kutuda krep, muz ve çilek. Her lokmayı çikolata sosuna batırabilirsin.",
    "name": "Krep Box",
    "category": "box",
    "price": 850,
    "portion": "2 kişilik",
    "coreIngredients": [
      "Krep",
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Krep ve meyveler çikolata soslarıyla sunulur. Servis içeriği şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc"
    ]
  },
  {
    "id": "pancake-box",
    "description": "Mini pankekler, muz ve çilekle kutuya girer. Yanında çikolata sosu var.",
    "name": "Pancake Box",
    "category": "box",
    "price": 850,
    "portion": "2 kişilik",
    "coreIngredients": [
      "Mini pankek",
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Pankek ve meyveler çikolata soslarıyla sunulur. Servis içeriği şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79"
    ]
  },
  {
    "id": "fondue-box",
    "description": "Muz ve çileği çikolata sosuna batırarak ye.",
    "name": "Fondue Box",
    "category": "box",
    "price": 850,
    "portion": "2 kişilik",
    "coreIngredients": [
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Taze meyveler çikolata soslarıyla sunulur. Sos çeşitleri ve servis içeriği şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.yemeksepeti.com/restaurant/c3gl/granny-waffles-and-kumpir-c3gl",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79"
    ]
  },
  {
    "id": "box-two",
    "description": "İki kişilik kutuda waffle ve brownie ayrı bölmelerde. Meyveni seç, iki göze soslarını ekle.",
    "name": "Granny’s Box",
    "category": "box",
    "price": 850,
    "portion": "2 kişilik",
    "coreIngredients": [
      "Waffle",
      "Brownie"
    ],
    "selectableIngredients": [
      "Çilek",
      "Muz",
      "Kivi",
      "Ananas",
      "Sütlü çikolata",
      "Beyaz çikolata",
      "Bitter çikolata",
      "Fındıklı çikolata",
      "Çilekli çikolata",
      "Antep fıstıklı çikolata",
      "Karamelli çikolata",
      "Frambuazlı çikolata",
      "Oreo bisküvi",
      "Hindistan cevizi",
      "Kavrulmuş yer fıstığı",
      "Lotus bisküvi",
      "Fındık",
      "Ceviz",
      "Haribo"
    ],
    "recipeNote": "İki kişilik waffle ve brownie kutusu, meyve ve iki çikolata sosuyla tamamlanır. Meyve ve süsleme seçenekleri şubede teyit edilir.",
    "configurable": true,
    "baseId": "box-two",
    "recipeCertainty": "printed-reference",
    "recipeSourceUrls": [
      "https://grannyswaffles.com.tr/menu/grannys-box/"
    ]
  },
  {
    "id": "box-three",
    "description": "Üç kişilik paylaşım kutusunda waffle, pankek, kruvasan, brownie ve meyve bir arada.",
    "name": "Granny’s Box",
    "category": "box",
    "price": 1250,
    "portion": "3 kişilik",
    "coreIngredients": [
      "Brüksel waffle",
      "Pankek",
      "Kruvasan",
      "Brownie",
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Karışık tatlı seçkisi ve meyvelerle paylaşmalık kutu. Porsiyon dağılımı ve sos çeşitleri şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "box-six",
    "description": "Altı kişilik kutuda waffle, pankek, mini kruvasan, brownie ve meyve paylaşılır.",
    "name": "Granny’s Box",
    "category": "box",
    "price": 1650,
    "portion": "6 kişilik",
    "coreIngredients": [
      "Waffle",
      "Pankek",
      "Mini kruvasan",
      "Brownie",
      "Muz",
      "Çilek"
    ],
    "selectableIngredients": [
      "Çikolata"
    ],
    "recipeNote": "Büyük Granny’s kutularının genel tatlı seçkisidir. Altı kişilik porsiyon dağılımı ve sos çeşitleri şubede teyit edilir.",
    "configurable": false,
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/c3gl/granny-waffles-and-kumpir-c3gl",
      "https://www.yemeksepeti.com/en/restaurant/tms6/grannys-waffles-and-kumpir-tms6"
    ]
  },
  {
    "id": "plain-kumpir",
    "description": "Sıcak fırın patatesin içi tereyağı ve kaşar peyniriyle karıştırılır.",
    "name": "Sade Kumpir",
    "category": "kumpir",
    "price": 370,
    "coreIngredients": [
      "Fırınlanmış patates",
      "Tereyağı",
      "Kaşar peyniri"
    ],
    "selectableIngredients": [
      "Mısır",
      "Kornişon",
      "Zeytin",
      "Havuç",
      "Kaşar peyniri",
      "Ekstra kaşar peyniri",
      "Ekstra tereyağı"
    ],
    "recipeNote": "Sade patates tabanı. İlave malzemelerin kapsamı ve olası fiyat farkları şubede teyit edilir.",
    "configurable": true,
    "baseId": "plain-kumpir",
    "recipeCertainty": "brand-general",
    "recipeSourceUrls": [
      "https://grannyswaffles.com.tr/menu/kumpir-kumru/",
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "granny-kumpir",
    "description": "Tereyağlı, kaşarlı patatese mısır, kornişon veya zeytin gibi sevdiğin malzemeleri ekle.",
    "name": "Granny’s Kumpir",
    "category": "kumpir",
    "price": 450,
    "coreIngredients": [
      "Fırınlanmış patates",
      "Tereyağı",
      "Kaşar peyniri"
    ],
    "selectableIngredients": [
      "Mısır",
      "Kornişon",
      "Zeytin",
      "Havuç",
      "Kaşar peyniri",
      "Ekstra kaşar peyniri",
      "Ekstra tereyağı"
    ],
    "recipeNote": "Tereyağı ve kaşarla karıştırılan patates, seçilen malzemelerle tamamlanır. Dahil malzemeler ve olası farklar şubede teyit edilir.",
    "configurable": true,
    "baseId": "granny-kumpir",
    "recipeCertainty": "brand-general",
    "recipeSourceUrls": [
      "https://grannyswaffles.com.tr/menu/kumpir-kumru/",
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402"
    ]
  },
  {
    "id": "grandma-kumpir",
    "description": "Fırın patates, tereyağı ve kaşarla hazırlanır. Ekstra tereyağı ve kaşar miktarı şubeye göre değişir.",
    "name": "Büyükanne Kumpir",
    "category": "kumpir",
    "price": 520,
    "coreIngredients": [
      "Fırınlanmış patates",
      "Tereyağı",
      "Kaşar peyniri"
    ],
    "selectableIngredients": [
      "Mısır",
      "Kornişon",
      "Zeytin",
      "Havuç",
      "Kaşar peyniri",
      "Ekstra kaşar peyniri",
      "Ekstra tereyağı"
    ],
    "recipeNote": "Bazı şubelerde ekstra tereyağı ve kaşarla hazırlanır. Miktar ve dahil malzemeler şubede teyit edilir.",
    "configurable": true,
    "baseId": "grandma-kumpir",
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc",
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.migros.com.tr/yemek/grannys-waffles-kumpir-kadikoy-caferaga-mah-st-18b79"
    ]
  },
  {
    "id": "kumpir-box",
    "description": "Tereyağı ve kaşarla karıştırılmış fırın patates kutuda sunulur.",
    "name": "Kumpir Box",
    "category": "kumpir",
    "price": 550,
    "coreIngredients": [
      "Fırınlanmış patates",
      "Tereyağı",
      "Kaşar peyniri"
    ],
    "selectableIngredients": [
      "Mısır",
      "Kornişon",
      "Zeytin",
      "Havuç",
      "Kaşar peyniri",
      "Ekstra kaşar peyniri",
      "Ekstra tereyağı"
    ],
    "recipeNote": "Kutuda kumpir sunumu. Bazı şubelerde kızarmış kaşarlı özel çeşidi bulunur; kutu içeriği şubede teyit edilir.",
    "configurable": true,
    "baseId": "kumpir-box",
    "recipeCertainty": "branch-reference",
    "recipeSourceUrls": [
      "https://grannyswaffles.com.tr/menu/kumpir-kumru/",
      "https://tgoyemek.com/restoranlar/424402",
      "https://www.yemeksepeti.com/en/restaurant/tms6/grannys-waffles-and-kumpir-tms6"
    ]
  },
  {
    "id": "kumru",
    "description": "Sıcak kumru ekmeğinin arasında sucuk, salam, kaşar ve özel sos var.",
    "name": "Kumru",
    "category": "kumpir",
    "price": 450,
    "coreIngredients": [
      "Kumru ekmeği",
      "Kaşar peyniri",
      "Sucuk",
      "Salam",
      "Özel sos"
    ],
    "selectableIngredients": [],
    "recipeNote": "Sıcak kumru ekmeğinde hazırlanır. Sos çeşidi ve şubeye özel içerikler teyit edilir.",
    "configurable": false,
    "recipeCertainty": "brand-general",
    "recipeSourceUrls": [
      "https://grannyswaffles.com.tr/menu/kumpir-kumru/",
      "https://www.yemeksepeti.com/en/restaurant/tms6/grannys-waffles-and-kumpir-tms6"
    ]
  }
]

/** Research explains uncertainty; it never overrides the user's printed prices. */
export const referenceNotes: ReferenceNote[] = [
  {
    id: 'printed-menu',
    note: 'Fiyat ve porsiyonlar şubenin basılı menüsünden alınmıştır. Online platformlardaki fiyatlar farklı olabilir.',
  },
  {
    id: 'waffle-general',
    sourceUrl: 'https://grannyswaffles.com.tr/menu/waffles-crepes/',
    note: 'Resmi genel menü waffle hamuru, çikolata, meyve ve sosları doğrular; özel ürünlerin sabit reçetelerini belirlemez.',
  },
  {
    id: 'bowl-presentation-conflict',
    sourceUrl: 'https://grannyswaffles.com.tr/menu/waffle-bowl/',
    note: 'Bowl, markanın pembe servis kabıyla gösterilir. Resmi sayfalardaki farklı kap ve içerik anlatımları için şube ekibinden bilgi alabilirsin.',
  },
  {
    id: 'box-scope',
    sourceUrl: 'https://grannyswaffles.com.tr/menu/grannys-box/',
    note: 'Resmi Box anlatımında iki çikolata bulunur; meyve anlatımları ile paylaşılan görseller arasında fark vardır. 2 kişilik kutu dışındaki boylara sos veya malzeme adedi türetilmez.',
  },
  {
    id: 'kumpir-and-kumru',
    sourceUrl: 'https://grannyswaffles.com.tr/menu/kumpir-kumru/',
    note: 'Kumpir tabanı patates, tereyağı ve kaşardır. Malzeme kapsamı ve olası fiyat farkları için şube ekibinden bilgi alabilirsin.',
  },
  {
    id: 'branch-recipes',
    sourceUrl: 'https://www.yemeksepeti.com/restaurant/csxc/grannys-waffles-and-kumpir-csxc',
    note: 'Brownie ve kruvasan bowl tabanları adlarıyla uyumludur. Granny’s Roll, Pankek ve diğer sabit ürünlerde bu şubenin ayrıntılı içeriği hedef şubenin kesin reçetesi sayılmamıştır.',
  },
  {
    id: 'sandwich-and-box-branch-conflicts',
    sourceUrl: 'https://tgoyemek.com/restoranlar/424402',
    note: 'Açık şube listelerinde Sandwich Waffle sabit veya seçilebilir malzemeli anlatılır; Box içerikleri ve kişi sayıları da değişebilir. Bu kaynaklar bilgi amaçlıdır; hedef şube kuralları veya fiyatları yerine geçirilmez.',
  },
]

export function normalizeTurkish(value: string): string {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Prefer product-name matches, while still allowing ingredient discovery. */
export function searchCatalogue(query: string, category: Category | 'all' = 'all'): CatalogueItem[] {
  const normalized = normalizeTurkish(query)
  const words = normalized.split(' ').filter(Boolean)
  return catalogue
    .filter((item) => category === 'all' || item.category === category)
    .map((item, position) => {
      const name = normalizeTurkish(item.name + ' ' + (item.portion ?? ''))
      const core = normalizeTurkish(item.coreIngredients.join(' '))
      const selectable = normalizeTurkish(item.selectableIngredients.join(' '))
      const haystack = name + ' ' + core + ' ' + selectable
      const matches = words.every((word) => haystack.includes(word))
      const score = !normalized ? 0 : name.includes(normalized) ? 3 : core.includes(normalized) ? 2 : 1
      return { item, position, matches, score }
    })
    .filter((entry) => entry.matches)
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map((entry) => entry.item)
}


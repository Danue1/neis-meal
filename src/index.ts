import * as Cheerio from 'cheerio'

export type NOT_EXISTS = ''
export type MenuTable = (NOT_EXISTS | DailyMenu)[]

export type DailyMenu = {
  breakfast: Menu
  lunch: Menu
  dinner: Menu
}

export type Menu = NOT_EXISTS | {
  food: Food
  nutrition: Nutrition
}

export type Food = string[]
export type Nutrition = string[] | null

export type HTML = string

export const NOT_EXISTS = ''
export const enum MENU {
  BREAKFAST = '조식',
  LUNCH = '중식',
  DINNER = '석식'
}

export default class NeisMeal {
  /**
   * @param body HTML
   */
  static init (body: HTML): MenuTable {
    // initialise for easy-extraction
    const source = NeisMeal.normaliseHTML(body)

    // extracts the daily menu table
    return source.map((value: string, index: number) => {
      const menuTable = value === NOT_EXISTS
        ? NOT_EXISTS
        : NeisMeal.getDayMenu(value)

      return menuTable
    })
    // remove row of menu
    .filter((value: any) => !!value)
  }

  /**
   * @param body HTML
   */
  private static normaliseHTML (body: string) {
    const $ = Cheerio.load(body, { xmlMode: true })

    const tableData = 'tbody tr td'
    const whiteSpace = /\s+/

    return $(tableData).map(function (index, element) {
      return $(this).text().replace(whiteSpace, NOT_EXISTS)
    }).get()
    .filter((value) => value !== ' ')
  }

  /**
   * @param value  menu table of a day
   */
  private static getDayMenu (value: string): DailyMenu {
    return {
      breakfast: NeisMeal.extractMenu(MENU.BREAKFAST, value),
      lunch: NeisMeal.extractMenu(MENU.LUNCH, value),
      dinner: NeisMeal.extractMenu(MENU.DINNER, value)
    }
  }

  /**
   * @param menu enum(조식, 중식, 석식)
   * @param value menu table of a day
   */
  private static extractMenu (menu: MENU, value: string): Menu {
    const pattern = new RegExp(`(\\[${ menu }\\])(.+?)(?=\\[)`)

    // hack for pattern-matching
    const __value = value + '['
    const __menu = __value.match(pattern)

    return (__menu)
      ? NeisMeal.separateMenu(__menu[2])
      : NOT_EXISTS
  }

  private static separateMenu (menu: string): Menu {
    return {
      // array of food
      food: menu
        .split(/\d{1,2}\./g)
        .filter((value) => !!value),
      // array of nutrition
      // Rice often doesn't have nutrient notation
      nutrition: menu
        .match(/(\d{1,2}\.)+/g)
    }
  }
}

import { env } from "node:process"

import { Telegraf, session } from "telegraf"
import { inlineKeyboard, keyboard, button } from "telegraf/markup"
import { SceneContext, Stage, } from "telegraf/scenes"
import { message } from "telegraf/filters"

import { calculate, order, question, answer, rates, receipt, review } from "./scenes"

const bot = new Telegraf<SceneContext>("7329082141:AAFQI7gg-Y9JdGgUpoTyvB3VDfaGFyr-kY4")
const scenes = new Stage([calculate, order, question as any, answer, rates, receipt, review])

bot.use(session())
bot.use(scenes.middleware())

bot.hears("Калькулятор", Stage.enter("CalculateScene") as any)
bot.hears("Задать курсы", Stage.enter("RatesScene") as any)

bot.hears("Отзывы", (ctx) => {
    ctx.reply("Чтобы посмотреть отзывы, нажмите кнопку ниже", inlineKeyboard([button.url("Посмотреть отзывы", "https://t.me/greenfeedback")]))
})

bot.hears("Связаться с поддержкой", (ctx) => {
    ctx.reply("Чтобы связаться с поддержкой, нажмите кнопку ниже", inlineKeyboard([button.url("Связаться с поддержкой", "https://t.me/greenmngr")]))
})

bot.action(/deny/, (ctx) => {
    const { id, price } = JSON.parse(ctx.match.input.split(" ").pop())
    ctx.scene.enter("ReviewScene", { id })
})
bot.action(/accept/, (ctx) => {
    const { id, price } = JSON.parse(ctx.match.input.split(" ").pop())
    ctx.telegram.sendMessage(
        id,
        `Итого к оплате: ${price}₽\n\nОплатите, пожалуйста, по:\n\n• номеру карты 2200700829011724\n\n• по номеру телефона 89261921149\n\n• Доставка и оплачивается по прибытию товара на склад в Китае. Итоговая стоимость доставки может незначительно отличаться.\n\n• Нажмите кнопку "Заказ оплачен" после перевода суммы`,
        inlineKeyboard([button.callback("Заказ оплачен", "order_paid")])
    )
})

bot.action("order_paid", (ctx) => {
    ctx.telegram.sendMessage(
        -4650285032,
        `Пользователь @${ctx.from.username} оплатил заказ.`,
        inlineKeyboard([button.callback("Отправить чек", "receipt " + ctx.from.id)])
    )
})

bot.action(/receipt/, (ctx) => {
    const chat_id = Number(ctx.match.input.split(" ").pop())
    ctx.scene.enter("ReceiptScene", { chat_id })
})

bot.action(/answer/, (ctx) => {
    const id = Number(ctx.match.input.split(" ").pop())
    ctx.scene.enter("AnswerScene", {user_id: id})
})

bot.start((ctx) => {
    ctx.reply("Главное меню", keyboard([
        [button.text("Калькулятор")],
        [button.text("Отзывы"), button.text("Связаться с поддержкой")],
        ["zheksnk", "vanyayep"].includes(ctx.from.username) ? [button.text("Задать курсы")] : []
    ]).resize())
})

// bot.on("text", (ctx) => {
//     console.log(ctx.chat.id)
// })

bot.launch()

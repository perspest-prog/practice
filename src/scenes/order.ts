import { Composer } from "telegraf";
import { WizardScene, WizardContext } from "telegraf/scenes";
import { inlineKeyboard, button } from "telegraf/markup";

const deliveryButtons = new Composer<WizardContext>()

deliveryButtons.action("ex", async (ctx) => {
    (ctx.scene.state as any).delivery = "ex"
    const { message_id } = await ctx.reply("Введите ссылку", inlineKeyboard([button.callback("Где и как найти ссылку", "link-help")]));
    (ctx.session as any).link_message = message_id
    ctx.wizard.next()
})

deliveryButtons.action("ec", async (ctx) => {
    (ctx.scene.state as any).delivery = "ec"
    const { message_id } = await ctx.reply("Введите ссылку", inlineKeyboard([button.callback("Где и как найти ссылку", "link-help")]));
    (ctx.session as any).link_message = message_id
    ctx.wizard.next()
})

const order = new WizardScene("OrderScene",
    async (ctx) => {
        await ctx.telegram.deleteMessage(ctx.chat.id, (ctx.session as any).calcMessage)
        await ctx.reply("Выберите тариф доставки", inlineKeyboard([[
            button.callback("Экспресс", "ex"),
            button.callback("Эконом", "ec"),
        ]]))
        ctx.wizard.next()
    },
    deliveryButtons,
    async (ctx) => {
        const message = (ctx.message as any).text as string
        const link = message.match(/https:\/\/dw4.co\/t\/A\/[A-Za-z0-9]{8}/)

        if (!link || link.length !== 1) {
            return ctx.reply("В сообщении нет ссылки на пойзон")
        }

        (ctx.wizard.state as any).link = link[0]
        const { message_id } = await ctx.reply("Введите ваш вариант или размер", inlineKeyboard([button.callback("Как определиться с размером?", "size-help")]));
        (ctx.session as any).size_message = message_id
        
        ctx.wizard.next()
    },
    (ctx) => {
        (ctx.wizard.state as any).variant = (ctx.message as any).text

        ctx.reply("Ваша заявка отправлена администратору, ожидайте")

        ctx.telegram.sendMessage(
            -4650285032,
            `Пользователь @${ctx.from.username} отправил заявку на заказ\n\nCсылка: ${(ctx.wizard.state as any).link}\n\nЦена: ${(ctx.wizard.state as any).price}\n\nКатегория: ${(ctx.wizard.state as any).category}\n\nРазмер или вариант: ${(ctx.wizard.state as any).variant}\n\nВариант доставки: ${(ctx.wizard.state as any).delivery}`,
            inlineKeyboard([[
                button.callback("Отклонить товар", "deny " + JSON.stringify({id: ctx.from.id, price: (ctx.scene.state as any).shipPrice})),
                button.callback("Принять товар", "accept " + JSON.stringify({id: ctx.from.id, price: (ctx.scene.state as any).shipPrice})),
            ]])
        )

        ctx.scene.leave()
    }
)

order.action("link-help", async (ctx) => {
    await ctx.replyWithVideo("BAACAgIAAxkBAAIFf2fKBHJWBR7tzreaNTOMFCxMv3mOAALUawACwd9RStytSrpkgW0iNgQ")
    await ctx.telegram.editMessageReplyMarkup(ctx.chat.id, (ctx.session as any).link_message, undefined, {inline_keyboard: []})
})

order.action("size-help", async (ctx) => {
    await ctx.replyWithVideo("BAACAgIAAxkBAAIF1mfPHe31PTnYqNyBUMRZC7otVn5lAAJsaAACWudBSjEBh938mUiPNgQ")
    await ctx.telegram.editMessageReplyMarkup(ctx.chat.id, (ctx.session as any).size_message, undefined, {inline_keyboard: []})
})

export default order;

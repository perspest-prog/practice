import { WizardScene } from "telegraf/scenes";

const review = new WizardScene("ReviewScene",
    (ctx) => {
        ctx.reply("Укажите причину отказа")
        ctx.wizard.next()
    },
    (ctx) => {
        const reason = (ctx.message as any).text

        ctx.telegram.sendMessage((ctx.wizard.state as any).id, `Ваш заказ не прошел проверку, причина:\n\n${reason}`)
        ctx.scene.leave()
    }
)

export default review;

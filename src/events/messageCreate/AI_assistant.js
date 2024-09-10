const OpenAI = require("openai");

const AIChat = require("../../models/AIChat");

const { TICKET_CATEGORY_ID, OPEN_AI_SECRET_KEY } = process.env;

const openAIClient = new OpenAI({
  apiKey: OPEN_AI_SECRET_KEY,
});

module.exports = async (message) => {
  try {
    const {
      author: { bot },
      channel: { id: channelId, parentId },
      content,
    } = message;

    if (bot) return;

    if (parentId !== TICKET_CATEGORY_ID) return;

    // const doc = await AIChat.findOne({ channelId });

    // const { messageHistory: messages } = doc;

    // console.log(messages);

    // messages.push({
    //   role: "system",
    //   content:
    //     "Be concise, dont send long messages, send short messages like humans do and send in informal way",
    // });
    // messages.push({ role: "user", content });

    // const chatCompletion = await openAIClient.chat.completions.create({
    //   messages,
    //   model: "gpt-4o-mini",
    // });

    // console.log(chatCompletion);

    // const reply = chatCompletion.choices[0].message.content;

    // console.log(reply);

    // messages.push({ role: "assistant", content: reply });

    // console.log(doc.messageHistory);

    // await message.reply(reply);

    // await doc.save();
  } catch (error) {
    console.log(error);

    await message.reply(error.message);
  }
};

import assert from "assert";
import config from "./config";
import prisma from "./db";
import client from "./tdlib";
import { isPresent } from 'ts-is-present';


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const inviteRegexp = /https:\/\/t.me\/\+.{16}$/g;

const CHAT_INVITE_LINK = 'https://t.me/+m0kXiUSLxZ04YjIy';

async function main() {
    await client.login();

    // Find user id by username
    const targetUser = await client.invoke({
        _: 'searchPublicChat',
        username: config.TARGET_USERNAME,
    });

    const targetUserId = targetUser.id;

    // Check that user is already in the chat
    const allChatsChat = await client.invoke({
        _: 'checkChatInviteLink',
        invite_link: config.TRAVEL_ASK_ALL_CHATS_CHAT_INVITE_LINK,
    });
    const isMember = allChatsChat.chat_id !== 0;
    if (!isMember) {
        await client.invoke({
            _: 'joinChatByInviteLink',
            invite_link: config.TRAVEL_ASK_ALL_CHATS_CHAT_INVITE_LINK,
        });
    }


    console.log('Chat ID', allChatsChat.chat_id);
    // Get all messages from the chat
    const initialMessages = await client.invoke({
        _: 'getChatHistory',
        chat_id: allChatsChat.chat_id,
        limit: 1
    });

    assert(initialMessages.messages !== undefined);
    const [firstMessage] = initialMessages.messages;

    assert(firstMessage !== undefined);

    const restMessages = await client.invoke({
        _: 'getChatHistory',
        chat_id: allChatsChat.chat_id,
        from_message_id: firstMessage.id,
        limit: 100,
    });

    const allMessages = [...initialMessages.messages, ...restMessages.messages].filter(isPresent)

    // Extract chat links from messages
    const chatLinks = allMessages
        .map((message) => {
            let links: string[] = [];
            if (message._ === 'message' && message.content._ === 'messageText') {
                const { entities } = message.content.text;
                 entities.forEach((entity) => {
                     if (entity.type._ === 'textEntityTypeTextUrl') {
                         const { url } = entity.type;
                         if (url.match(inviteRegexp)) {
                             links.push(url);
                         }
                     }
                 })
                return links;
            }
            return undefined;
        }).flatMap((links) => links ?? []);
    
    console.log('Chat links', chatLinks);
    
    // Find target user messages in Moldova chat

    const chatInviteLinkInfo = await client.invoke({
        _: 'checkChatInviteLink',
        invite_link: CHAT_INVITE_LINK,
    });

    
    let chat
    if (chatInviteLinkInfo.chat_id === 0) {
         chat = await client.invoke({
            _: 'joinChatByInviteLink',
            invite_link: CHAT_INVITE_LINK,
        });
    } else {
        chat = await client.invoke({
            _: 'getChat',
            chat_id: chatInviteLinkInfo.chat_id,
        });
    }

      const messages = await client.invoke({
            _: 'searchChatMessages',
            chat_id: chat.id,
            sender_id: {
              _: 'messageSenderUser',
              user_id: targetUserId,
            },
            limit: 100,
      });
    
    for (const message of messages.messages.filter(isPresent)) { 
        if (message.content._ !== 'messageText') return;
        const messageLink = await client.invoke({
            _: 'getMessageLink',
            chat_id: chat.id,
            message_id: message.id,
        });
        // const messageDate = new Date(message.date * 1000);
        // const messageText = message.content.text.text;
        console.log(messageLink);
        await delay(1000);
    }

    console.log('Target user messages', messages.total_count);
     console.log('First message', messages.messages[0]?.content);

    
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error while running bot", e);
    await prisma.$disconnect();
    process.exit(1);
  });

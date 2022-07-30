<template>
  <div>
    <beautiful-chat
      :participants="participants"
      :onMessageWasSent="onMessageWasSent"
      :messageList="messageList"
      :newMessagesCount="newMessagesCount"
      :isOpen="isChatOpen"
      :close="closeChat"
      :open="openChat"
      :showTypingIndicator="showTypingIndicator"
      :showLauncher="showLauncher"
      :showCloseButton="showCloseButton"
      :colors="colors"
      :alwaysScrollToBottom="alwaysScrollToBottom"
      :disableUserListToggle="disableUserListToggle"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  name: 'ChatBox',
  setup(){
    const websocket = new WebSocket(process.env.VUE_APP_WS_URL);

    const showTypingIndicator = ref('');
    const showLauncher = ref(true);
    const showCloseButton = ref(true);
    const alwaysScrollToBottom = ref(true);
    const disableUserListToggle = ref(false);
    const currentRoomId = ref('testroomid');
    //
    const isChatOpen = ref(false);
    const newMessagesCount = ref(0);
    const participants = [];
    const messageList = ref([]);
    const colors = ref({
        header: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        launcher: {
          bg: '#4e8cff'
        },
        messageList: {
          bg: '#ffffff'
        },
        sentMessage: {
          bg: '#4e8cff',
          text: '#ffffff'
        },
        receivedMessage: {
          bg: '#eaeaea',
          text: '#222222'
        },
        userInput: {
          bg: '#f4f7f9',
          text: '#565867'
        }
      });

    const onMessageWasSent = (message) => {
      console.log(message);
      websocket.send(getWsMessageJsonStr(message));
      messageList.value.push(message);
    };
    const closeChat = () => {
      websocket.send(getWsLeaveJsonStr());
      isChatOpen.value = false;
    };
    const openChat = () => {
      isChatOpen.value = true;
      websocket.send(getWsJoinJsonStr());
    };

    const getWsJoinJsonStr = () => {
      return `{"action": "join", "roomid": "${currentRoomId.value}"}`;
    };
    const getWsLeaveJsonStr = () => {
      return `{"action": "leave", "roomid": "${currentRoomId.value}"}`;
    };
    const getWsMessageJsonStr = (message) => {
      return `{"action": "sendmessage", "roomid": "${currentRoomId.value}", "data": "${message.data.text}"}`;
    };
    websocket.onmessage = (event) => {
      console.log('websocket.onmessage()');
      if (event && event.data) {
        const resData = JSON.parse(event.data);
        // TODO 自身の発言をチェックして除外する
        if (resData.action == 'sendmessage') {
          const newmsg = {
            type: 'text',
            author: 'user1',
            data: {
              text: resData.data
            }
          }
          messageList.value.push(newmsg);
        }
      }
    };

    return {
      showTypingIndicator,
      showLauncher,
      showCloseButton,
      alwaysScrollToBottom,
      disableUserListToggle,
      //
      participants,
      //
      isChatOpen,
      newMessagesCount,
      messageList,
      colors,
      //
      onMessageWasSent,
      closeChat,
      openChat
    }
  }
}
</script>

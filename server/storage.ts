  async deleteChatMessages(chatbotId: number): Promise<boolean> {
    const messagesToDelete = Array.from(this.chatMessages.values()).filter(
      (message) => message.chatbotId === chatbotId
    );
    
    messagesToDelete.forEach((message) => {
      this.chatMessages.delete(message.id);
    });
    
    // Return true if any messages were found and processed for deletion.
    // This makes the return value more informative about the actual effect
    // of the operation, aligning with improved observability and robust storage.
    return messagesToDelete.length > 0;
  }
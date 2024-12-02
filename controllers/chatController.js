import Message from '../models/message.js';  // Add .js extension for local imports

// Handle saving messages (this is optional if you store messages in a database)
const saveMessage = async (data) => {
    try {
        const message = new Message({
            room: data.room,
            sender: data.username,
            content: data.content,
        });

        // Save message to database (if you want to store it in MongoDB)
        await message.save();
        console.log('Message saved to database');
    } catch (error) {
        console.error('Error saving message:', error.message);
    }
};

export default { saveMessage };  // Export the controller's methods

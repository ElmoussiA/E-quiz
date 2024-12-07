const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({ region: 'eu-north-1' }); // Replace with your AWS region

const sns = new AWS.SNS();

const publishNotification = async (message, topicArn) => {
    const params = {
        Message: message, // The message to send
        TopicArn: topicArn, // The SNS topic ARN
    };

    try {
        const result = await sns.publish(params).promise();
        console.log('Notification sent:', result.MessageId);
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
};

module.exports = { publishNotification };

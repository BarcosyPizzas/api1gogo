import AWS from 'aws-sdk';

// Configuración de AWS
AWS.config.update({ 
    region: process.env.AWS_REGION || 'us-east-1',
});

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var queueURL = process.env.SQS_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/077262805448/LudopatiaQueue";


const API_URL = 'http://localhost:3000';

async function receiverofMessages() {
    var params = {
        MaxNumberOfMessages: 1,
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 10,
    };
    
    try{
        const data = await sqs.receiveMessage(params).promise();
        console.log(data);

        if(data.Messages){
            for(const message of data.Messages){
                const body = JSON.parse(message.Body);
                console.log('Mensaje recibido:', body);

                // Make POST request to /apuestas endpoint
                try {
                    const response = await fetch(`${API_URL}/apuestas`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: body.payload.id,
                            apuesta_id: body.payload.apuesta_id,
                            monto: body.payload.monto
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    console.log('Apuesta creada:', result);
                } catch (error) {
                    console.error('Error al crear apuesta:', error);
                }

                await sqs.deleteMessage({
                    QueueUrl: queueURL,
                    ReceiptHandle: message.ReceiptHandle
                }).promise();

                console.log('Mensaje eliminado de la cola');
            }
        }
    } catch(err){
        console.error('Error al recibir mensaje:', err);
    }
    setInterval(receiverofMessages, 10000);
}

export default receiverofMessages;
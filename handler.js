const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb')
const { v4: uuidv4 } = require('uuid')

const client = new DynamoDBClient({ region: 'ap-south-1' })
const dynamoDb = DynamoDBDocumentClient.from(client)

module.exports.createTask = async (event) => {
  const data = JSON.parse(event.body)

  const params = {
    TableName: 'Todos',
    Item: {
      // id: data.id,
      id: uuidv4(),
      title: data.title,
      column: data.column,
      due: data.due,
    },
  }

  try {
    await dynamoDb.send(new PutCommand(params))
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Task created successfully!' }),
    }
  } catch (error) {
    console.log('Error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not create task' }),
    }
  }
}

module.exports.getTasks = async (event) => {
  const params = {
    TableName: 'Todos',
  }

  try {
    const result = await dynamoDb.send(new ScanCommand(params))
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(result.Items),
    }
  } catch (error) {
    console.log('Error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not fetch tasks' }),
    }
  }
}

module.exports.deleteTask = async (event) => {
  const { id } = event.pathParameters

  const params = {
    TableName: 'Todos',
    Key: {
      id: id,
    },
  }

  try {
    await dynamoDb.send(new DeleteCommand(params))
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Task deleted successfully!' }),
    }
  } catch (error) {
    console.log('Error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not delete task' }),
    }
  }
}

module.exports.updateTask = async (event) => {
  const { id } = event.pathParameters
  const data = JSON.parse(event.body)

  if (!data.title || !data.column || !data.due) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Missing required fields' }),
    }
  }

  const params = {
    TableName: 'Todos',
    Key: { id },
    UpdateExpression: 'set #title = :title, #column = :column, #due = :due',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#column': 'column',
      '#due': 'due',
    },
    ExpressionAttributeValues: {
      ':title': data.title,
      ':column': data.column,
      ':due': data.due,
    },
    ReturnValues: 'UPDATED_NEW',
  }

  try {
    console.log('Update params:', JSON.stringify(params))
    const result = await dynamoDb.send(new UpdateCommand(params))
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Task updated successfully!', result }),
    }
  } catch (error) {
    console.log('Error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not update task' }),
    }
  }
}

import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { command } = await req.json()

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps users manage a spreadsheet. 
Your task is to interpret user commands for specific cells and respond with a JSON object 
that represents the action to be taken.

For cell-specific commands, use the following format:
"For cell A1: Set value to 100" should output:
{ "type": "EDIT_CELL", "payload": { "rowId": "1", "cellId": "1-1", "value": "100" } }

For formulas, keep the formula as-is:
"For cell B3: =A1+A2" should output:
{ "type": "EDIT_CELL", "payload": { "rowId": "3", "cellId": "3-2", "value": "=A1+A2" } }

ALWAYS return a properly formatted JSON response. 
If you're unsure about the data or command, respond with:
{ "type": "ERROR", "payload": { "message": "I couldn't process that request. Please try again." } }

Respond only with the JSON object, no additional text.`,
        },
        {
          role: "user",
          content: command,
        },
      ],
    })

    const response = completion.choices[0].message.content

    // Ensure the response is valid JSON
    JSON.parse(response)

    return new Response(response, {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing cell command:", error)
    return new Response(
      JSON.stringify({
        type: "ERROR",
        payload: { message: "Failed to process the command. Please try again." },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}


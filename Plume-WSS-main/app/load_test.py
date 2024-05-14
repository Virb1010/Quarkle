import logging
import time

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def loadtest(websocket):
    # Simulate the request from the user as a list of tokens
    response_text = """
    Absolutely, here are five pointers to amp up the intrigue:
    1. **Deepen Character Complexity**: Flesh out the characters with more nuanced personalities and conflicted emotions. For instance, further explore Sergeant-Major Morris's internal struggle about introducing the paw, or illuminate the underlying dynamics in the White family pre-talisman to make their transformations more dramatic post-wish.
    2. **Heighten Suspense**: Gradually build up to the wishes instead of having them occur so quickly. Tease the reader by hinting at the paw's powers and the consequences of wishes made elsewhere before anyone actually makes a wish. Why not stretch the tension like a rubber band ready to snap?
    3. **Increase Stakes**: Ensure the reader feels what's at risk with every wish. Let's have the Whites discuss what they could lose, and be more detailed about the changes they face. A ticking clock element, such as a looming deadline or event, could ramp up pressure and force difficult decisions.
    4. **Enhance Imagery**: Use more vivid, sensory language to paint the scene - the coldness of the wind, the eerie shadows cast by the candle, even the characters' visceral reactions to the paw - so readers can truly immerse themselves in the environment. Stir their senses and they'll be putty in your hands.
    5. **Complex Wish Outcomes**: Play with the consequences of the wishes more. The results could be multifaceted, setting off a domino effect of events rather than single, isolated occurrences. The aftermath of a wish should unravel like a sweater caught on a fence - unexpected, unraveling mysteries.
    Remember, the most compelling stories make readers ask "What would I do?" Now go on, sprinkle some creative moon dust on that manuscript and watch it sparkle! DONE!"""
    simulated_request = response_text.split(" ")

    for token in simulated_request:
        if token != None and token != "":
            await websocket.send(token)
        time.sleep(0.01)

    # Close the connection
    await websocket.close()
    logger.info("WebSocket connection closed")
    return

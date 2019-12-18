import { Repository } from 'typeorm';
import { Coffee } from '../../src/models/coffee';
import { Machine } from '../../src/models/machine';
import { createOnCoffeeProduced } from '../../src/service/coffeeProducedEventHandler';
import { Websocket } from '../../src/websocket';

describe('when onCoffeeProduced is called', () => {
    function createMockedOnCoffeeProduced() {
        const mockMachine = {};
        const mockBroadcast = jest.fn(() => { return; });
        const mockWebsocket: unknown = { broadcast: mockBroadcast };
        const mockSave = jest.fn(() => { return; });
        const mockCoffeeRepo: unknown = { save: mockSave };
        const onCoffeeProduced = createOnCoffeeProduced(mockMachine as Machine,
            mockCoffeeRepo as Repository<Coffee>,
            mockWebsocket as Websocket);
        return { mockBroadcast, mockSave, onCoffeeProduced };
    }

    test('it tries to save a new coffee', async () => {
        const { mockSave, onCoffeeProduced } = createMockedOnCoffeeProduced();
        await onCoffeeProduced();
        expect(mockSave.mock.calls.length).toBe(1);
    });

    test('broadcasts a message', async () => {
        const { mockBroadcast, onCoffeeProduced } = createMockedOnCoffeeProduced();
        await onCoffeeProduced();
        expect(mockBroadcast.mock.calls.length).toBe(1);
    });
});

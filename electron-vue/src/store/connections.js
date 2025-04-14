import Vue from 'vue'
import { UNIT_NAMES, FILE_TYPE_COLOR } from '../components/FileProcessingUnits/UnitNameList'

export const connectionStore = Vue.observable({
    connections: [],
    draggingConnection: null,
    startPoint: null,
    connectionColor: null
})

export const connectionMethods = {
    addConnection(from, to) {
        let actualFrom = from;
        let actualTo = to;

        const fromUnit = UNIT_NAMES.find(unit => unit.component === this.getUnitType(from.unitId));
        const toUnit = UNIT_NAMES.find(unit => unit.component === this.getUnitType(to.unitId));

        const isFromInput = from.circleId.startsWith('input');
        const isToInput = to.circleId.startsWith('input');

        if (isFromInput && !isToInput) {
            actualFrom = to;
            actualTo = from;
        }

        if ((isFromInput && isToInput) || (!isFromInput && !isToInput)) {
            const fromEl = document.querySelector(`[data-unit-id="${from.unitId}"]`);
            const toEl = document.querySelector(`[data-unit-id="${to.unitId}"]`);
            const fromRect = fromEl?.getBoundingClientRect();
            const toRect = toEl?.getBoundingClientRect();

            if (fromRect && toRect && fromRect.left > toRect.left) {
                actualFrom = to;
                actualTo = from;
            }
        }

        const fromCircle = fromUnit?.circleOutput?.find((_, index) => `output-${index}` === actualFrom.circleId) ||
            fromUnit?.circleInput?.find((_, index) => `input-${index}` === actualFrom.circleId);

        connectionStore.connections.push({
            from: actualFrom,
            to: actualTo,
            color: fromCircle?.color || '#ff6e6e'
        });
    },
    removeConnection(connection) {
        const index = connectionStore.connections.indexOf(connection)
        if (index > -1) {
            connectionStore.connections.splice(index, 1)
        }
    },
    startConnection(unitId, circleId, event) {
        const existingConnection = connectionStore.connections.find(conn =>
            (conn.from.unitId === unitId && conn.from.circleId === circleId) ||
            (conn.to.unitId === unitId && conn.to.circleId === circleId)
        );

        if (existingConnection) {
            const isFromNode = existingConnection.from.unitId === unitId && existingConnection.from.circleId === circleId;
            this.removeConnection(existingConnection);
            connectionStore.draggingConnection = isFromNode ? existingConnection.to : existingConnection.from;
            connectionStore.connectionColor = existingConnection.color;
        } else {
            const unit = UNIT_NAMES.find(unit => unit.component === this.getUnitType(unitId));
            const circle = circleId.startsWith('output')
                ? unit?.circleOutput?.[parseInt(circleId.split('-')[1])]
                : unit?.circleInput?.[parseInt(circleId.split('-')[1])];

            connectionStore.draggingConnection = { unitId, circleId };
            connectionStore.connectionColor = circle?.color;
        }

        connectionStore.startPoint = { x: event.clientX, y: event.clientY };
    },
    endConnection(unitId, circleId) {
        if (connectionStore.draggingConnection) {
            if (!unitId) {
                connectionStore.draggingConnection = null;
                connectionStore.startPoint = null;
                connectionStore.connectionColor = null;
                return;
            }

            if (connectionStore.draggingConnection.unitId !== unitId) {
                const startUnit = UNIT_NAMES.find(unit => unit.component === this.getUnitType(connectionStore.draggingConnection.unitId));
                const endUnit = UNIT_NAMES.find(unit => unit.component === this.getUnitType(unitId));

                const startCircle = connectionStore.draggingConnection.circleId.startsWith('output')
                    ? startUnit?.circleOutput?.[parseInt(connectionStore.draggingConnection.circleId.split('-')[1])]
                    : startUnit?.circleInput?.[parseInt(connectionStore.draggingConnection.circleId.split('-')[1])];

                const endCircle = circleId.startsWith('output')
                    ? endUnit?.circleOutput?.[parseInt(circleId.split('-')[1])]
                    : endUnit?.circleInput?.[parseInt(circleId.split('-')[1])];

                const isValidDirection = (
                    (connectionStore.draggingConnection.circleId.startsWith('output') && circleId.startsWith('input')) ||
                    (connectionStore.draggingConnection.circleId.startsWith('input') && circleId.startsWith('output'))
                );

                const isValidType = startCircle?.type === endCircle?.type;

                if (isValidDirection && isValidType) {
                    this.addConnection(
                        connectionStore.draggingConnection,
                        { unitId, circleId }
                    );
                }
            }
            connectionStore.draggingConnection = null;
            connectionStore.startPoint = null;
            connectionStore.connectionColor = null;
            document.dispatchEvent(new CustomEvent('clearMousePosition'));
        }
    },
    cancelConnection() {
        connectionStore.draggingConnection = null;
        connectionStore.startPoint = null;
    },
    getUnitType(unitId) {
        const index = parseInt(unitId.split('-')[1]);
        return document.querySelector(`[data-unit-id="${unitId}"]`)?.__vue__?.type;
    }
} 
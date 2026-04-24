const {
    StateController,
} = require('../../services/utit-of-work/state-controller.model');

describe('state controller', () => {
    /**
     * @type {StateController}
     */
    let stateController;

    beforeEach(() => {
        stateController = new StateController({
            rollback: () => {},
            try: () => {},
        });
    });

    test('main', () => {
        const stateController = new StateController();

        const LocalBuffer = {
            summ: 5,
        };

        stateController.setAction((controller) => {
            const InnerStateContainers = {
                A: new StateController(),
                B: new StateController(),
                C: new StateController(),
            };

            InnerStateContainers.A.setAction((controller) => {
                controller.setStatus(StateController.Status.Done);
            });

            InnerStateContainers.B.setAction((controller) => {
                controller.setStatus(StateController.Status.Done);
            });

            InnerStateContainers.C.setAction((controller) => {
                controller.setStatus(StateController.Status.Done);
            });

            InnerStateContainers.A.try();
            InnerStateContainers.B.try();
            InnerStateContainers.C.try();

            const statusA = InnerStateContainers.A.getStatus();
            const statusB = InnerStateContainers.B.getStatus();
            const statusC = InnerStateContainers.C.getStatus();

            console.log({ statusA, statusB, statusC });

            const Statuses = {
                statusA,
                statusB,
                statusC,
            };

            const Flags = {
                rejected: undefined,
                pending: undefined,
                done: undefined,
            };
            for (const InnerContainerStatus of Object.values(Statuses)) {
                console.log({ InnerContainerStatus });
                if (InnerContainerStatus === StateController.Status.Rejected) {
                    Flags.rejected = true;
                    break;
                }

                if (InnerContainerStatus === StateController.Status.Pending) {
                    Flags.pending = true;
                }

                if (InnerContainerStatus === StateController.Status.Done) {
                    Flags.done = true;
                }
            }

            /**
             * the checking-chain is mean that
             * if any one state-controller is `StateController.Status.Rejected`
             * then server-controller is `StateController.Status.Rejected`
             * but if no one is `StateController.Status.Rejected` and any one is `StateController.Status.Pending`
             * then server-controller is StateController.Status.Pending
             * but if all over is StateController.Status.Done then server is StateController.Status.Done too
             * and finally if some one returns like that `StateController.Status === undefined`
             * then it`s throw Error
             */

            if (Flags.rejected === true) {
                controller.setStatus(StateController.Status.Rejected);
            } else if (Flags.pending === true) {
                controller.setStatus(StateController.Status.Pending);
            } else if (Flags.done) {
                controller.setStatus(StateController.Status.Done);
            } else {
                throw new Error(`StateControllerAction: no one status is sat`);
            }

            controller.setStatus;
        });

        stateController.try();

        const StateControllerState = stateController.getStatus();

        expect(StateControllerState).toEqual(StateController.Status.Pending);
    });
});

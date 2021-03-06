export class TransitionTable {
    transitions: any[];
    initial_state_data: {};
    get(to_state: any, current_context: any): import("../../action_sequencer/ActionSequencer").default;
    add_transitions(transitions: any): void;
    set_transitions(transitions: any): void;
    set_initial_state_data(initial_state_data: any): void;
}

import Time from '../../Time';
import ViewState from '../ViewState';

export default class ViewStateTransitionHandler
{
  constructor(transition_table)
  {
    this.last_state = new ViewState();
    this.current_state = new ViewState();

    this.initial_state_data = {};
    this.current_state_data = {};

    this.transition_table = transition_table;

    this.transitioning = false;
  }

  go_to_state(state, skip = false)
  {
    this.last_state = this.current_state;
    this.current_state = state;

    this.last_state.before_exit();
    this.current_state.show();
    this.current_state.before_enter();

    this.action_sequencer = this.transition_table.get(this.current_state.name, this.current_state_data);
    this.action_sequencer.play();

    this.transitioning = true;

    if (skip)
    {
      this.action_sequencer.skip();
      this.update();
    }
  }

  update()
  {
    if (this.transitioning)
    {
      this.action_sequencer.update(Time.delta_time);
      this.current_state.update_transition(this.current_state_data, this.action_sequencer.get_progress());

      if (this.action_sequencer.is_finished())
      {
        this.transitioning = false;

        if (this.last_state.name !== this.current_state.name)
        {
          this.last_state.hide();
        }

        this.last_state.on_exit();
        this.current_state.on_enter();
      }
    }
    else
    {
      this.current_state.update();
    }
  }

  set_state(state)
  {
    this.current_state = state;
  }

  set_initial_state_data(initial_state_data)
  {
    Object.assign(this.initial_state_data, initial_state_data);
    Object.assign(this.current_state_data, initial_state_data);
  }
}

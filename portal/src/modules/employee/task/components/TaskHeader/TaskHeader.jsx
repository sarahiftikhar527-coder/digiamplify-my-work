const TaskHeader = ({
  title = 'My Tasks',
  subtitle = 'Manage your tasks and stay productive.',
}) => (
  <header>
    <h1 className="text-3xl font-medium text-white">{title}</h1>
    <p className="mt-3 text-sm text-white">{subtitle}</p>
  </header>
);

export default TaskHeader;
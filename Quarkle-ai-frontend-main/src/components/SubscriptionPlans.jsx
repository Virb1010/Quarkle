export function BasicPlan({ className, onClick }) {
  return (
    <div className={`${className} text-sm font-normal`} onClick={onClick}>
      <h1 className="mb-3 text-base font-bold">Quarkle Basic</h1>
      <ul>
        <li> &bull; Access to Quarkle Basic Model</li>
        <li> &bull; Built on GPT-3.5</li>
        <li> &bull; Unlimited Chat</li>
        <li> &bull; Unlimited Critique</li>
        <li> &bull; Autonomous AI assistance </li>
      </ul>
    </div>
  );
}

export function ProPlan({ className, onClick }) {
  return (
    <div className={`${className} cursor-pointer text-sm font-normal`} onClick={onClick}>
      <h1 className="mb-3 text-base font-bold">Quarkle Pro</h1>
      <ul>
        <li> &bull; Everything in Quarkle Basic</li>
        <li> &bull; Access to Quarkle Pro Model</li>
        <li> &bull; Access to Open Expression Mode</li>
        <li> &bull; Built on GPT-4</li>
        <li> &bull; Exclusive Pro Features</li>
      </ul>
    </div>
  );
}

export function EnterprisePlan({ className, onClick }) {
  return (
    <div className={className} onClick={onClick}>
      <h1 className="mb-3 text-base font-semibold">Quarkle Enterprise</h1>
      <p> Unlimited GPT-4 Commentary</p>
      <p> Unlimited Chat</p>
      <p> Unlimited Full Text GPT-4 Analysis</p>
    </div>
  );
}

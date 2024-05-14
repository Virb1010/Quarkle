function TagInput({ tag, selected, onClick }) {
  const isActive = selected === tag;
  return (
    <div
      className={`m-1 h-min w-fit cursor-pointer rounded border-2 border-[#323354] px-2 py-1 text-sm hover:border-white hover:font-bold ${
        isActive ? "border-white font-bold" : ""
      }`}
      onClick={onClick}
    >
      {tag}
    </div>
  );
}

export default TagInput;

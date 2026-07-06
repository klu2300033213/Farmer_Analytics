import { useNavigate } from "react-router-dom";

function NavigationArrows() {
  const navigate = useNavigate();

  return (
    <div className="navigation-arrows">
      <button className="nav-arrow-button" onClick={() => navigate(-1)}>
        ⬅
      </button>

      <button className="nav-arrow-button" onClick={() => navigate(1)}>
        ➡
      </button>
    </div>
  );
}

export default NavigationArrows;

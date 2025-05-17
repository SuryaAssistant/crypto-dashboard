// 1. Load the widget script dynamically
const script = document.createElement("script");
script.src = "https://static.coinstats.app/widgets/v5/cs-widget.js";
script.async = true;
document.head.appendChild(script);

// 2. Create and configure the custom widget element
script.onload = () => {
    const widget = document.createElement("cs-widget");
    widget.setAttribute("type", "fear-and-greed");
    widget.setAttribute("theme", "dark");
    widget.setAttribute("direction", "horizontal");
    widget.setAttribute("background", "#0D1117");
    widget.setAttribute("is-market-sentiment-visible", "true");
    widget.setAttribute("is-last-updated-visible", "true");
    widget.setAttribute("title-color", "#FFFFFF");
    widget.setAttribute("chart-indicator-one-color", "#F02935");
    widget.setAttribute("chart-indicator-two-color", "#F07D29");
    widget.setAttribute("chart-indicator-three-color", "#9ACB82");
    widget.setAttribute("chart-indicator-four-color", "#34B349");
    widget.setAttribute("subtitle-color", "#999999");
    widget.setAttribute("last-updated-color", "#999999");
    widget.setAttribute("arrow-color", "#262626");

    document.getElementById("fng-widget-container").appendChild(widget);
};


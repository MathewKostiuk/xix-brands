console.log("kit-builder.js");

function toggleTeamDetails() {
  const selector = ".kb-pane-teams .kb-editor-heading";
  const element = document.querySelector(selector);
  const activeClass = "kb-wizard-group-header-selected";

  if (element && !element.classList.contains(activeClass)) {
    element.click();
  }
}

function addToCart({ variantId }) {
  const productToCartEl = document.querySelector("product-to-cart");
  const item = {
    id: variantId,
    quantity: 1,
    selling_plan: "",
    properties: {},
  };
  productToCartEl.addToCart([item], variantId);
}

document.addEventListener("KitBuilderLoaded", function () {
  repeatUntilTrueOrMaxAttempts(
    automaticPreviewViewBackOnPlayerNameOrNumberChange
  );
  console.log("KitBuilderLoaded");
  repeatUntilTrueOrMaxAttempts(toggleTeamDetails);

  KitBuilder.init("#kitBuilder", {
    auth: {
      shopifyAppProxyUrl: "/a/kit-builder",
    },
    cartItemPricingMethod: "SimpleTieredPricing",
    currencySymbol: "$",
    currencySymbolAfter: "",
    cartType: "Shopify",
    customCallbacks: {
      webhookAddSingleItemToCartCallback: async function (data) {
        const response = JSON.parse(data.content);
        console.log({ data, response });
        addToCart({ variantId: response.variantId });
      },
    },
  });
});

// Automatic preview and view back of model when changing player name/number
// This is called every time the user clicks Add Player (see below)
function automaticPreviewViewBackOnPlayerNameOrNumberChange() {
  const playerRows = document.querySelectorAll(".kb-units-table .kb-table-row");
  const changeViewButtons = document.querySelectorAll(
    ".kb-overlay-button.kb-change-view-button"
  );

  if (playerRows.length && changeViewButtons.length) {
    playerRows.forEach(function (playerRow) {
      const name = playerRow.querySelector(".kb-unit-name .kb-text-box");
      const number = playerRow.querySelector(".kb-unit-number .kb-text-box");
      const previewButton = playerRow.querySelector(
        ".kb-unit-preview .kb-preview"
      );

      const onKeyUp = function () {
        console.log({ name: name.value, number: number.value, previewButton });
        // Must use angular here, $(el).trigger('click') does not work
        // and $(el).click() doesn't let us differentiate between script and user clicks
        window.angular.element(previewButton).trigger("click", ["AutoPreview"]);

        changeViewButtons.forEach(function (button) {
          if (
            /back/i.test(button.textContent) &&
            window.getComputedStyle(button).display !== "none" &&
            !button.classList.contains("kb-change-view-button-disabled")
          ) {
            button.click();
          }
        });
      };

      name.removeEventListener("keyup", onKeyUp);
      number.removeEventListener("keyup", onKeyUp);
      name.addEventListener("keyup", onKeyUp);
      number.addEventListener("keyup", onKeyUp);
    });

    return true;
  }
}

// Calls handler every ELEMENT_SEARCH_INTERVAL milliseconds,
// until handler returns true or it reaches MAX_SEARCH_ATTEMPTS attempts.
function repeatUntilTrueOrMaxAttempts(handler) {
  const ELEMENT_SEARCH_INTERVAL = 500;
  const MAX_SEARCH_ATTEMPTS = 15;
  let intervalId = null;
  let count = 0;

  const done = function () {
    clearInterval(intervalId);
  };

  const handlerWrapper = function () {
    if (handler() || count++ > MAX_SEARCH_ATTEMPTS) {
      done();
    }
  };

  intervalId = setInterval(handlerWrapper, ELEMENT_SEARCH_INTERVAL, done);
}

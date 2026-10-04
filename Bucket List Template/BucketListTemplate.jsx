import React, { useMemo, useState } from "react";
import "./BucketListTemplate.css";

/*
|--------------------------------------------------------------------------
| Template data
|--------------------------------------------------------------------------
|
| These are the destinations that each template pre-fills.
| Everything in the preview remains editable/removable before adding.
|
*/

const TEMPLATES = {
  weekend: {
    id: "weekend",
    name: "Weekend",
    color: "coral",
    destinations: [
      {
        id: "tokyo",
        name: "Tokyo, Japan",
      },
      {
        id: "hong-kong",
        name: "Hong Kong",
      },
      {
        id: "singapore",
        name: "Singapore",
      },
    ],
  },

  solo: {
    id: "solo",
    name: "Solo",
    color: "blue",
    destinations: [
      {
        id: "siargao",
        name: "Siargao, Philippines",
      },
      {
        id: "queenstown",
        name: "Queenstown, New Zealand",
      },
      {
        id: "hoi-an",
        name: "Hoi An, Vietnam",
      },
    ],
  },

  family: {
    id: "family",
    name: "Family",
    color: "lime",
    destinations: [
      {
        id: "osaka",
        name: "Osaka, Japan",
      },
      {
        id: "gold-coast",
        name: "Gold Coast, Australia",
      },
      {
        id: "bali",
        name: "Bali, Indonesia",
      },
    ],
  },

  adventure: {
    id: "adventure",
    name: "Adventure",
    color: "green",
    destinations: [
      {
        id: "banff",
        name: "Banff, Canada",
      },
      {
        id: "patagonia",
        name: "Patagonia",
      },
      {
        id: "new-zealand",
        name: "New Zealand",
      },
    ],
  },
};

const TEMPLATE_LIST = Object.values(TEMPLATES);

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function BucketListTemplate({
  bucketPlaces = [],

  /*
   * Called when the user goes back without adding
   * anything.
   */
  onBack,

  /*
   * Called after "Add to bucket list".
   */
  onAddToBucketList,

  /*
   * Optional callback if the parent owns bucket state.
   */
  onBucketPlacesChange,
}) {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState("solo");

  /*
   * The preview is copied from the selected template.
   * Removing an item only affects this preview.
   */
  const [previewDestinations, setPreviewDestinations] =
    useState(
      TEMPLATES.solo.destinations
    );

  /*
  |--------------------------------------------------------------------------
  | Selected template
  |--------------------------------------------------------------------------
  */

  const selectedTemplate = useMemo(
    () =>
      TEMPLATES[selectedTemplateId],
    [selectedTemplateId]
  );

  /*
  |--------------------------------------------------------------------------
  | Select template
  |--------------------------------------------------------------------------
  */

  function selectTemplate(template) {
    setSelectedTemplateId(template.id);

    setPreviewDestinations(
      template.destinations.map(
        (destination) => ({
          ...destination,
        })
      )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Remove preview destination
  |--------------------------------------------------------------------------
  */

  function removePreviewDestination(
    destinationId
  ) {
    setPreviewDestinations(
      (current) =>
        current.filter(
          (destination) =>
            destination.id !==
            destinationId
        )
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Add to bucket list
  |--------------------------------------------------------------------------
  */

  function handleAddToBucketList() {
    /*
     * Existing destinations are not duplicated.
     */
    const existingIds = new Set(
      bucketPlaces.map(
        (place) => place.id
      )
    );

    const newPlaces =
      previewDestinations
        .filter(
          (destination) =>
            !existingIds.has(
              destination.id
            )
        )
        .map((destination) => ({
          id: destination.id,
          name: destination.name,

          /*
           * Template additions always start
           * as incomplete.
           */
          completed: false,

          color:
            selectedTemplate.color,
        }));

    const updatedPlaces = [
      ...bucketPlaces,
      ...newPlaces,
    ];

    /*
     * Update shared state when the parent
     * provides the callback.
     */
    if (onBucketPlacesChange) {
      onBucketPlacesChange(
        updatedPlaces
      );
    }

    /*
     * Tell the application to navigate
     * back to Bucket List.
     */
    if (onAddToBucketList) {
      onAddToBucketList(
        newPlaces,
        updatedPlaces
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Start blank
  |--------------------------------------------------------------------------
  */

  function handleStartBlank() {
    /*
     * No state is changed.
     *
     * This deliberately returns the user
     * to Bucket List unchanged.
     */
    if (onBack) {
      onBack();
    }
  }

  return (
    <div className="bucket-template-page">
      <main className="bucket-template-shell">
        {/* ==============================================================
            NAVIGATION
        ============================================================== */}

        <nav className="bucket-template-nav">
          <div className="template-logo">
            Logo
          </div>

          <button
            type="button"
            className="template-nav-item"
          >
            Dashboard
          </button>

          <button
            type="button"
            className="template-nav-item"
          >
            My plans
          </button>

          <button
            type="button"
            className="template-nav-item active"
          >
            Bucket list
          </button>

          <button
            type="button"
            className="template-nav-item"
          >
            Journal
          </button>

          <button
            type="button"
            className="template-nav-item explore"
          >
            Explore <span>▾</span>
          </button>

          <div className="template-profile" />
        </nav>

        {/* ==============================================================
            BACK
        ============================================================== */}

        <button
          type="button"
          className="template-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        {/* ==============================================================
            PAGE TITLE
        ============================================================== */}

        <h1 className="template-page-title">
          Start your bucket list with a
          template
        </h1>

        {/* ==============================================================
            TEMPLATE CARDS
        ============================================================== */}

        <section className="template-selector">
          {TEMPLATE_LIST.map(
            (template) => {
              const selected =
                selectedTemplateId ===
                template.id;

              return (
                <button
                  type="button"
                  key={template.id}
                  className={`
                    template-card
                    template-${template.color}
                    ${
                      selected
                        ? "selected"
                        : ""
                    }
                  `}
                  onClick={() =>
                    selectTemplate(
                      template
                    )
                  }
                >
                  <div className="template-card-art" />

                  <span>
                    {template.name}
                  </span>
                </button>
              );
            }
          )}
        </section>

        {/* ==============================================================
            PREVIEW
        ============================================================== */}

        <section className="template-preview">
          <h2>
            Destinations in{" "}
            {selectedTemplate.name}
          </h2>

          <div className="preview-list">
            {previewDestinations.length >
            0 ? (
              previewDestinations.map(
                (destination) => (
                  <div
                    className="preview-row"
                    key={destination.id}
                  >
                    <span>
                      {destination.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removePreviewDestination(
                          destination.id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                )
              )
            ) : (
              <div className="preview-empty">
                No destinations selected.
              </div>
            )}
          </div>
        </section>

        {/* ==============================================================
            ACTIONS
        ============================================================== */}

        <div className="template-actions">
          <button
            type="button"
            className="add-template-button"
            onClick={
              handleAddToBucketList
            }
          >
            Add to bucket list
          </button>

          <button
            type="button"
            className="start-blank-button"
            onClick={handleStartBlank}
          >
            Start blank instead
          </button>
        </div>

        {/* ==============================================================
            HELPER TEXT
        ============================================================== */}

        <p className="template-help">
          Add to bucket list adds them as not
          completed and returns to the Bucket
          list. Start blank instead returns to
          the Bucket list unchanged. Back
          returns to Bucket list.
        </p>
      </main>
    </div>
  );
}
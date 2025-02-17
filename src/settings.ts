import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCardGroupEntity = formattingSettings.CardGroupEntity; // Corrected import
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

export class LegendSettings extends FormattingSettingsCardGroupEntity {
    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true
    });

    public position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Position",
        items: [
            { value: "Top", displayName: "Top" },
            { value: "Bottom", displayName: "Bottom" },
            { value: "Left", displayName: "Left" },
            { value: "Right", displayName: "Right" },
        ],
        value: { value: "Top", displayName: "Top" } // Valor padrão
    });

    public fontSize = new formattingSettings.NumUpDown({
      name: "fontSize",
      displayName: "Font Size",
      value: 12
    });

    name: string = "legend";
    displayName: string = "Legend";
    slices: Array<FormattingSettingsSlice> = [this.show, this.position, this.fontSize];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    legendCard = new LegendSettings();

    cards = [this.legendCard];
}
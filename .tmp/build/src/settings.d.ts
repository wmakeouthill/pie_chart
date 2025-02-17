import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCardGroupEntity = formattingSettings.CardGroupEntity;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
export declare class LegendSettings extends FormattingSettingsCardGroupEntity {
    show: formattingSettings.ToggleSwitch;
    position: formattingSettings.ItemDropdown;
    fontSize: formattingSettings.NumUpDown;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
/**
* visual settings model class
*
*/
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    legendCard: LegendSettings;
    cards: LegendSettings[];
}

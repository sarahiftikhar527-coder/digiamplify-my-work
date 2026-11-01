import ListboxSelect from "../ListboxSelect";
import { CONTACT_METHODS } from "../../../../../constants/helpandsupport";

const PreferredContactSelect = ({ value, onChange, error, disabled }) => (
  <ListboxSelect
    id="rp-contactMethod"
    ariaLabel="Preferred contact method"
    value={value}
    options={CONTACT_METHODS}
    onChange={onChange}
    error={error}
    disabled={disabled}
    dropUp
  />
);

export default PreferredContactSelect;
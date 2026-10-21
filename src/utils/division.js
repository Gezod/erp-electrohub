/**
 * isGaDivision
 * Cocok dengan backend src/shared/middlewares/authorize.js -> isGaDivision().
 * Menentukan apakah sebuah divisi (nama/kode) adalah divisi General Affairs/HRGA,
 * berdasarkan nama — BUKAN division_id hardcode via env var (rapuh lintas environment/seed).
 */
export function isGaDivision(name, code) {
  const n = (name || '').toLowerCase();
  const c = (code || '').toLowerCase();
  return n.includes('general affairs') || n.includes('ga') || n.includes('hrga') || c.includes('ga') || c.includes('hrga');
}

/** Terima objek employee hasil EmployeeMapper.toUI (punya .division / .divisionId) */
export function employeeIsGaDivision(employee) {
  if (!employee) return false;
  const div = employee.division || employee.employee?.division;
  return isGaDivision(div?.name, div?.code);
}

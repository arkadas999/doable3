import BillingController from './BillingController'
import DashboardController from './DashboardController'
import TaskController from './TaskController'
import HabitController from './HabitController'
import HabitEntryController from './HabitEntryController'
import TimezoneController from './TimezoneController'
import AccentController from './AccentController'
import Settings from './Settings'

const Controllers = {
    BillingController: Object.assign(BillingController, BillingController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    TaskController: Object.assign(TaskController, TaskController),
    HabitController: Object.assign(HabitController, HabitController),
    HabitEntryController: Object.assign(HabitEntryController, HabitEntryController),
    TimezoneController: Object.assign(TimezoneController, TimezoneController),
    AccentController: Object.assign(AccentController, AccentController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers
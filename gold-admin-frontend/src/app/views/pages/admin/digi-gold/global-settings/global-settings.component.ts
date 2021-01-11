import { Component } from '@angular/core';

@Component({
  selector: 'kt-global-settings',
  template: `<kt-portlet>
              <kt-portlet-body>
                <kt-global-settings-shared></kt-global-settings-shared>
              </kt-portlet-body>
            </kt-portlet>`
})
export class GlobalSettingsComponent { }

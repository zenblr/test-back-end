import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalSettingService } from '../../../../core/global-setting/services/global-setting.service';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth';

@Component({
	selector: 'kt-digi-gold',
	template: `<router-outlet></router-outlet>`,
})
export class DigiGoldComponent implements OnInit {
	constructor(
		private globalSettingService: GlobalSettingService,
		private authService: AuthService
	) { }

	ngOnInit() {
		this.globalSettingService.getDigiGoldSetting().pipe(map(res => {
			this.globalSettingService.globalSetting.next(res);
		})).subscribe();
	}

	ngOnDestroy() {
		if (this.authService.isLoggedIn()) {
			this.globalSettingService.getGlobalSetting().pipe(map(res => {
				this.globalSettingService.globalSetting.next(res);
			})).subscribe();
		}
	}
}

from django.conf.urls import patterns, include, url
from django.contrib import admin

from processify import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'processify.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^login/$', views.login, name='login'),
    url(r'^signup/$', views.signup, name='signup'),
    url(r'^task/$', views.mytask, name='task'),
    url(r'^process/$', views.manageProcess, name='process'),
    url(r'^project/$', views.manageProject, name='project'),
    url(r'^parket/$', views.parket, name='parket'),
    url(r'^canvas/$', views.pcanvas, name='pcanvas'),
    url(r'^admin/', include(admin.site.urls)),
)

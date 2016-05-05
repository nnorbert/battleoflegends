<div id="page-wrapper"><div id="page">

  <div id="header" class="<?php print $secondary_menu ? 'with-secondary-menu': 'without-secondary-menu'; ?>"><div class="section clearfix">

    <?php if ($logo): ?>
      <!--<a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home" id="logo">-->
      <div id="logo">
        <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" />
      </div>
      <!--</a>-->
    <?php endif; ?>

  </div></div> <!-- /.section, /#header -->

  <div id="main-wrapper" class="clearfix"><div id="main" class="clearfix">

    <div id="content" class="column"><div class="section">
      <?php print render($page['content']); ?>
    </div></div> <!-- /.section, /#content -->


  </div></div> <!-- /#main, /#main-wrapper -->

</div></div> <!-- /#page, /#page-wrapper -->
